# Architecture & Operations Reference

> Single source of truth for how this repo, its Supabase database, and its Vercel
> hosting fit together. Read this before diving into the codebase. Keep it current
> when you change the data model, env, deployment, or any of the "gotchas" below.

## What this app is

**Weekend Attendance Generator** — a single-page PWA used by a church small group to
track each member's weekend attendance status and generate a formatted text report
to paste into a chat (WhatsApp/Telegram). Originally a CS50 final project (see
`README.md` for the original writeup/demo video), it has since grown **multi-group**
support, a redesigned UI, search, and a light/dark theme switcher.

There is **no auth and no per-user data** — anyone with the URL can read and edit
every group's lists. The database RLS policies are intentionally fully open (see
[Security model](#security-model)).

## Tech stack

| Layer      | Choice                                                                 |
|------------|------------------------------------------------------------------------|
| Framework  | Next.js 15 (App Router), React 19, TypeScript                          |
| Dev server | `next dev --turbopack`                                                  |
| Styling    | Tailwind CSS v4 (`@tailwindcss/postcss`), custom design tokens in `globals.css` |
| Icons      | `react-icons` (Ionicons `io5`, AntDesign loader)                       |
| Font       | `Bricolage_Grotesque` via `next/font/google` (CSS var `--font-bricolage`) |
| Backend    | Supabase (Postgres + Realtime), accessed directly from the browser     |
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
                          handlers, the realtime subscription, copyGenerate(), theme
                          toggle, search, sort. Props: { groupKey, groupLabel,
                          onSwitchGroup }.
    GroupPicker.tsx       Landing list of groups (one card per groups-table row).
    Person.tsx            One row: name input + status <select> + delete button.
    InstallPrompt.tsx     PWA "add to home screen" prompt.
  lib/
    supabaseClient.ts     createClient() from NEXT_PUBLIC_SUPABASE_URL/KEY.
  ts/
    server.ts             All Supabase data access (see Data layer below).
    helper.ts             unicodeFormat() (maps ASCII → Unicode bold/italic code
                          points for the report header) and generateId() (Date.now()
                          string).
    enums.ts              STATUSENUM — the list of selectable statuses.
middleware.ts             Matches only /people; returns Edge Config currentPeople/
                          defaultPeople/settings as JSON. Standalone from the app.
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
4. **Save** — `postCurrPpl` / `postDefPpl` **delete all rows for that group, then bulk
   re-insert** the current state (a full replace, not a diff). Each persisted row gets
   `{ ...person, group: groupKey }`.
5. **Realtime** — `SupabaseChangeListener(changeBuffer, groupKey)` subscribes to
   Postgres changes on `current_people` and `default_people` filtered to
   `group=eq.<key>` (unique channel `supabase-listener-<groupKey>`). Incoming changes
   are buffered (500ms). If a change did **not** originate from this client
   (`changeBuffer.origin`), it `alert()`s "Data has been updated. Please reload page".
   This is an optimistic-concurrency guard, not a live merge — there is no automatic
   re-fetch.
6. **Generate** — `copyGenerate()` saves current, then builds a grouped text report and
   copies it to the clipboard. The header is rendered in Unicode bold via
   `unicodeFormat()` so it survives plain-text chat apps.

## Data layer (`app/ts/server.ts`)

| Function | Purpose |
|----------|---------|
| `getGroups()` | `select * from groups order by label` → drives the picker. (Note: code orders by `label`; the table also has `sort_order`, currently unused by this query.) |
| `getPeople(groupKey)` | Fetches `current_people` + `default_people` where `group = groupKey`, sorted by name. |
| `postCurrPpl(people, changeBuffer, groupKey)` | Delete-then-insert full replace of `current_people` for the group. Sets `changeBuffer.origin = true` so the realtime guard ignores its own write. |
| `postDefPpl(people, changeBuffer, groupKey)` | Same, for `default_people`. |
| `SupabaseChangeListener(changeBuffer, groupKey)` | Group-scoped realtime subscription (see Data flow #5). |

`PersonData` (`{ id, name, status }`) does **not** carry `group` in component state;
the group is attached only at write time.

## Supabase

- **Project name:** `wknd-attd`
- **Project ref / ID:** `wavnyrpdvomgoigttura` (region `ap-southeast-1`, Postgres 17)
- **API URL:** `https://wavnyrpdvomgoigttura.supabase.co`
- **Org ID:** `muvdifcafbemvacjrvvq`
- There is a second, unrelated **INACTIVE** project named `ALTr`
  (`mtshczfewlaznuzoottx`) on the same org — not used by this app.
- One migration applied: `20260616110848_add_group_column_and_registry`.

### Schema (public)

**`groups`** — registry that drives the UI. Add a row here and a new group appears in
the picker **with zero code change** (the core design goal of multi-group support).
| column | type | notes |
|--------|------|-------|
| `key` | text | **PK**. Used in URLs, localStorage, and the `group` discriminator on the data tables. |
| `label` | text | Display name shown in the picker / header chip. |
| `sort_order` | int | default 0. Present but the app currently orders the picker by `label`, not this. |

Current rows: `('lba3','LBA 3',0)`, `('lba2','LBA 2',1)`.

**`current_people`** and **`default_people`** — identical shape.
| column | type | notes |
|--------|------|-------|
| `id` | bigint | **PK**, identity `BY DEFAULT`. App supplies `Date.now()`-string ids on insert (Postgres accepts them; identity is a fallback). |
| `name` | text | nullable, default `''`. |
| `status` | text | one of `STATUSENUM` (not enforced at the DB level — it's a plain text column). |
| `group` | text | default `'lba3'`. The discriminator; every query filters on it. |

Row counts at time of writing: `current_people` 36, `default_people` 13, `groups` 2.

### Realtime

Only `current_people` and `default_people` are in the `supabase_realtime`
publication. `groups` is not (it changes rarely and isn't watched).

### Security model

RLS is **enabled** on all three tables but the policies are **fully open** by design
(no auth in the app):
- `current_people` / `default_people`: `ALL` for `public` (anon) `using (true)`, plus
  redundant `authenticated` ALL and public `SELECT` policies.
- `groups`: public `SELECT` only (read-only from clients).

The Supabase **anon/publishable key** is shipped to the browser via
`NEXT_PUBLIC_SUPABASE_KEY` — this is expected for Supabase, but combined with the open
policies it means **anyone with the key can read/write the people tables**. This is an
accepted tradeoff for a low-stakes internal tool; do not assume any access control
exists. If hardening is ever needed, that means adding auth + tightening these
policies.

#### Advisor findings (`get_advisors` security, last run 2026-06-17)

All **WARN** level — no errors. These confirm the open-by-design posture above; none
are accidental misconfigurations, but they are the things to address first if the app
ever needs real access control.

| Finding | Affected | Notes / remediation |
|---------|----------|---------------------|
| **RLS Policy Always True** (`rls_policy_always_true`) | `current_people` and `default_people` — both the `Enable access for authenticated users` and `Enable full access for anon users` `ALL` policies | `USING (true)`/`WITH CHECK (true)` on write commands effectively bypasses RLS. Intentional here (no auth). To harden: scope writes (e.g. require auth, or per-group checks) — [linter 0024](https://supabase.com/docs/guides/database/database-linter?lint=0024_permissive_rls_policy). The public `SELECT` policies are *not* flagged (deliberate public read). `groups` (read-only) is clean. |
| **Vulnerable Postgres version** (`vulnerable_postgres_version`) | project config (`supabase-postgres-17.4.1.069`) | Security patches available for the running Postgres. Low-effort, low-risk win: upgrade in the dashboard — [upgrade guide](https://supabase.com/docs/guides/platform/upgrading). |

Re-run `get_advisors` (security + performance) after any DDL/policy change and update
this table.

### Inspecting / changing the DB

Use the Supabase MCP tools against `project_id: wavnyrpdvomgoigttura`
(`list_tables`, `execute_sql`, `apply_migration`, `get_advisors`). Run `get_advisors`
after any DDL. There is no local `supabase/` CLI directory or checked-in migration
files — schema lives in the remote project and is managed via MCP.

## Vercel

- Linked via `.vercel/project.json` (gitignored): project `wknd-attd`,
  `projectId: prj_Yx7CFb205dnrCHQr45VzlU8Z4oSR`, `orgId: team_wHeYb35F2XA3BcBoBZfb8jmd`.
- Standard Next.js deployment; pushes to the default branch deploy automatically.
- **Environment variables** (set in the Vercel dashboard, mirrored in local `.env`):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_KEY`
  - (If `middleware.ts` / `/people` is used, Vercel Edge Config must be attached —
    it reads `currentPeople` / `defaultPeople` / `settings` keys.)
- `.env` is gitignored; never commit secrets. Both Supabase values are public-by-design
  (`NEXT_PUBLIC_`), but treat the deploy/edge-config tokens as secret.

## Local development

```bash
npm install
# create .env with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_KEY
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
  row for the group then re-insert. Two people saving the same group concurrently can
  clobber each other — the realtime "please reload" alert is the only guard.
- **Realtime is a refresh nudge, not live sync.** A non-origin change just alerts the
  user to reload; state is not auto-merged or re-fetched.
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
  Edge Config at `/people` and is independent of the Supabase flow.
- **`plans/` and `.playwright-mcp/` are gitignored** local working dirs.
