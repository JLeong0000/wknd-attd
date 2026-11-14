# Architecture & Operations Reference

> Single source of truth for how this repo, its Turso database, and its Vercel
> hosting fit together. Read this before diving into the codebase. Keep it current
> when you change the data model, env, deployment, or any of the "gotchas" below.

## What this app is

**Weekend Attendance Generator** — a single-page PWA used by a church small group to
track each member's weekend attendance status and generate a formatted text report
to paste into a chat (WhatsApp/Telegram). Originally a CS50 final project (see
`README.md` for the original writeup/demo video), it has since grown **multi-group**
support, a redesigned UI, search, and a light/dark theme switcher.

There is **no auth and no per-user data** — anyone with the URL can read and edit
every group's lists (see [Security model](#security-model)).

## Tech stack

| Layer      | Choice                                                                 |
|------------|------------------------------------------------------------------------|
| Framework  | Next.js 15 (App Router), React 19, TypeScript                          |
| Dev server | `next dev --turbopack`                                                  |
| Styling    | Tailwind CSS v4 (`@tailwindcss/postcss`), custom design tokens in `globals.css` |
| Icons      | `react-icons` (Ionicons `io5`, AntDesign loader)                       |
| Font       | `Bricolage_Grotesque` via `next/font/google` (CSS var `--font-bricolage`) |
| Backend    | Turso (libSQL/SQLite) via `@libsql/client`, accessed only from Next.js server actions |
| PWA        | `@ducanh2912/next-pwa` (**production builds only** — see gotchas)       |
| Hosting    | Vercel                                                                  |
| Edge Config| `@vercel/edge-config` — used only by `middleware.ts` for a `/people` debug/export endpoint (not part of the main app flow) |

## Repo map

```
app/
  layout.tsx              Root layout: metadata, PWA manifest link, font, inline
                          script that applies the saved theme before paint.
  page.tsx                Thin client router/landing. Resolves the active group from
                          ?group= → localStorage → GroupPicker. Wraps useSearchParams
                          in <Suspense>.
  globals.css             Tailwind import + design tokens (light/dark via [data-theme]).
  manifest.json           PWA manifest (also referenced from layout metadata).
  types.ts                PersonData, Group, ChangeBuffer.
  components/
    Attendance.tsx        The whole attendance board for one group. All board state,
                          handlers, copyGenerate(), theme
                          toggle, search, sort. Props: { groupKey, groupLabel,
                          onSwitchGroup }.
    GroupPicker.tsx       Landing list of groups (one card per groups-table row).
    Person.tsx            One row: name input + status <select> + delete button.
    InstallPrompt.tsx     PWA "add to home screen" prompt.
  lib/
    db.ts                 libSQL createClient() from TURSO_DATABASE_URL/AUTH_TOKEN.
                          `import "server-only"` — must never reach the browser bundle.
  ts/
    server.ts             "use server" — all DB access as server actions (see Data layer).
    helper.ts             unicodeFormat() (maps ASCII → Unicode bold/italic code
                          points for the report header) and generateId() (Date.now()
                          string).
    enums.ts              STATUSENUM — the list of selectable statuses.
middleware.ts             Matches only /people; returns Edge Config currentPeople/
                          defaultPeople/settings as JSON. Standalone from the app.
db/
  schema.sql              Turso schema (idempotent CREATE ... IF NOT EXISTS).
next.config.ts            Wraps config in next-pwa ONLY when NODE_ENV=production.
public/                   PWA icons + generated sw.js / workbox-*.js (build artifacts).
docs/ARCHITECTURE.md      This file.
plans/                    Local planning docs (gitignored).
```

Files referenced in older docs but **deleted** (do not recreate): `app/ts/app.ts`
(hit a non-existent `/api/current` route), `app/ts/vars.ts`. The old single-group
`app/page.tsx`-as-board structure was split into `page.tsx` (router) +
`components/Attendance.tsx`.

## Data flow

1. **Landing** — `page.tsx` calls `getGroups()` and resolves which group to show:
   `?group=<key>` in the URL wins, else the cached `localStorage["wknd-attd:selectedGroup"]`,
   else render `GroupPicker`. Picking a group caches the key and `router.replace`s to
   `/?group=<key>`. "Switch" clears the cache and returns to the picker.
2. **Board load** — `Attendance` calls `getPeople(groupKey)`, which fetches both
   `current_people` and `default_people` filtered by `group` and sorts by name.
   - `current_people` = the live, working list being edited this week.
   - `default_people` = the reset template. "Reset" copies default → current (in state
     only, until Saved). "Edit Default" edits the template via `tempDefPpl`.
3. **Edit** — name/status edits mutate local state and set a `*Modified` flag that
   enables the Save / Update button. Nothing persists until the user saves.
4. **Save** — `postCurrPpl` / `postDefPpl` **delete all rows for that group, then
   re-insert** the current state (a full replace, not a diff) in a single libSQL
   write batch (one transaction). They return `false` on failure and the client shows
   "Failed to save".
5. **Generate** — `copyGenerate()` saves current, then builds a grouped text report and
   copies it to the clipboard. The header is rendered in Unicode bold via
   `unicodeFormat()` so it survives plain-text chat apps.

## Data layer (`app/ts/server.ts`)

| Function | Purpose |
|----------|---------|
| `getGroups()` | `select ... from groups order by label` → drives the picker. (Note: code orders by `label`; the table also has `sort_order`, currently unused by this query.) |
| `getPeople(groupKey)` | Fetches `current_people` + `default_people` where `group = groupKey`, sorted by name. |
| `postCurrPpl(people, groupKey)` | Transactional delete-then-insert full replace of `current_people` for the group. Returns success boolean. |
| `postDefPpl(people, groupKey)` | Same, for `default_people`. |

These are server actions: client components import and call them like normal async
functions, and Next.js turns each call into a POST to the server. Return values must
be plain serializable objects (libSQL `Row`s are mapped to plain objects).

`PersonData` (`{ id, name, status }`) does **not** carry `group` in component state;
the group is attached only at write time.

## Turso

- **Database:** `wknd-attd` (Turso account `jleong0000`, group `default`, region
  `aws-ap-northeast-1` Tokyo)
- **URL:** `libsql://wknd-attd-jleong0000.aws-ap-northeast-1.turso.io`
- New tokens: `turso db tokens create wknd-attd`.
- Schema lives in `db/schema.sql` (checked in). Apply changes with
  `turso db shell <db> < db/schema.sql` or ad-hoc SQL via `turso db shell <db>`.
- Data was copied from the old Supabase project (`wavnyrpdvomgoigttura`) on
  2026-11-14 by a one-off script (since deleted; see git history of commit `d99d013`).
  That project is no longer used by the app.

### Schema

**`groups`** — registry that drives the UI. Add a row here and a new group appears in
the picker **with zero code change** (the core design goal of multi-group support).
| column | type | notes |
|--------|------|-------|
| `key` | text | **PK**. Used in URLs, localStorage, and the `group` discriminator on the data tables. |
| `label` | text | Display name shown in the picker / header chip. |
| `sort_order` | integer | default 0. Present but the app currently orders the picker by `label`, not this. |

Current rows: `('lba3','LBA 3',0)`, `('lba2','LBA 2',1)`.

**`current_people`** and **`default_people`** — identical shape.
| column | type | notes |
|--------|------|-------|
| `id` | text | **PK**. App supplies `Date.now()`-string ids (migrated Supabase bigint ids were stringified). |
| `name` | text | not null, default `''`. |
| `status` | text | one of `STATUSENUM` (not enforced at the DB level — it's a plain text column). |
| `group` | text | FK → `groups.key`. The discriminator; every query filters on it. Quote it (`"group"`) in SQL — it's a keyword. |

Row counts at migration (2026-11-14): `current_people` 38, `default_people` 38, `groups` 2.

### No realtime

Turso has no change-feed equivalent of Supabase Realtime, so the old "Data has been
updated, please reload" alert was removed. Concurrent saves to the same group are
last-write-wins.

### Security model

The Turso auth token is **server-only** (`TURSO_AUTH_TOKEN`, no `NEXT_PUBLIC_`
prefix) and is read only in `app/lib/db.ts`. The browser never talks to Turso directly.
Note, though, that the server actions themselves are unauthenticated public POST
endpoints. Anyone who can load the app can read and write every group, same as before.
This is an accepted tradeoff for a low-stakes internal tool. If hardening is ever
needed, add auth checks inside the server actions.

## Vercel

- Linked via `.vercel/project.json` (gitignored): project `wknd-attd`,
  `projectId: prj_Yx7CFb205dnrCHQr45VzlU8Z4oSR`, `orgId: team_wHeYb35F2XA3BcBoBZfb8jmd`.
- Standard Next.js deployment; pushes to the default branch deploy automatically.
- Functions (the server actions) are pinned to `sin1` (Singapore) in `vercel.json`,
  close to users and to the Turso DB in Tokyo. Without it they default to `iad1`.
- **Environment variables** (set in the Vercel dashboard, mirrored in local `.env`):
  - `TURSO_DATABASE_URL` (`libsql://...`)
  - `TURSO_AUTH_TOKEN` (**secret**)
  - (If `middleware.ts` / `/people` is used, Vercel Edge Config must be attached —
    it reads `currentPeople` / `defaultPeople` / `settings` keys.)
- `.env` is gitignored; never commit secrets.

## Local development

```bash
npm install
# create .env with TURSO_DATABASE_URL and TURSO_AUTH_TOKEN
# (or TURSO_DATABASE_URL=file:local.db for an offline SQLite copy)
npm run dev      # http://localhost:3000 (Turbopack, PWA disabled)
npm run build    # production build (next-pwa kicks in here)
npm run start    # serve the production build
npm run lint
```

## Gotchas & non-obvious behavior

- **PWA is production-only.** `next.config.ts` only wraps with `next-pwa` when
  `NODE_ENV=production`, because next-pwa/Workbox was incompatible with Turbopack dev
  (commit `146d9fe`). `public/sw.js` and `public/workbox-*.js` are generated build
  artifacts.
- **Saving is destructive replace, not a diff.** `postCurrPpl`/`postDefPpl` delete every
  row for the group then re-insert (atomically). Two people saving the same group
  concurrently: the last save wins silently. There is no realtime guard anymore.
- **No DB-level status validation.** `status` is free text; valid values come only from
  `STATUSENUM` in `app/ts/enums.ts`. Changing report grouping logic in `copyGenerate()`
  must stay in sync with these strings.
- **`copyGenerate()` S1/S3 condition quirk** (`Attendance.tsx`, ~line 119): the filter
  is `p.status.includes("S1: Sitting") || (p.status.includes("S3: Sitting") && p.name)`.
  Operator precedence means the `&& p.name` empty-name guard applies only to S3, not S1.
  Harmless in practice but worth knowing before refactoring the report logic.
- **Theme** is stored in `localStorage["wknd-attd:theme"]` and applied pre-paint by an
  inline script in `layout.tsx` (avoids a flash). The toggle sets
  `document.documentElement.dataset.theme`; tokens live in `globals.css` under
  `[data-theme="dark"]`.
- **Selected group** is cached in `localStorage["wknd-attd:selectedGroup"]`; an invalid/
  stale key is ignored and falls through to the picker.
- **`middleware.ts` is unrelated to the main app** — it serves a JSON dump of Vercel
  Edge Config at `/people` and is independent of the Turso flow.
- **`plans/` and `.playwright-mcp/` are gitignored** local working dirs.
