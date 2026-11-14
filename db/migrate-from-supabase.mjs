// One-off copy of all data from Supabase into Turso.
// Usage: node --env-file=.env db/migrate-from-supabase.mjs
// Needs NEXT_PUBLIC_SUPABASE_URL/KEY (source) and TURSO_DATABASE_URL/AUTH_TOKEN (target).
import { readFileSync } from "node:fs";
import { createClient } from "@libsql/client";

const { NEXT_PUBLIC_SUPABASE_URL: sbUrl, NEXT_PUBLIC_SUPABASE_KEY: sbKey } = process.env;

const fetchTable = async table => {
    const res = await fetch(`${sbUrl}/rest/v1/${table}?select=*`, {
        headers: { apikey: sbKey, Authorization: `Bearer ${sbKey}` },
    });
    if (!res.ok) throw new Error(`${table}: ${res.status} ${await res.text()}`);
    return res.json();
};

const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

await db.executeMultiple(readFileSync(new URL("./schema.sql", import.meta.url), "utf8"));

const groups = await fetchTable("groups");
const current = await fetchTable("current_people");
const defaults = await fetchTable("default_people");

const people = (table, rows) =>
    rows.map(r => ({
        sql: `INSERT INTO ${table} (id, name, status, "group") VALUES (?, ?, ?, ?)`,
        args: [String(r.id), r.name ?? "", r.status, r.group],
    }));

await db.batch(
    [
        "DELETE FROM current_people",
        "DELETE FROM default_people",
        "DELETE FROM groups",
        ...groups.map(g => ({
            sql: "INSERT INTO groups (key, label, sort_order) VALUES (?, ?, ?)",
            args: [g.key, g.label, g.sort_order ?? 0],
        })),
        ...people("current_people", current),
        ...people("default_people", defaults),
    ],
    "write"
);

console.log(`Copied groups=${groups.length} current_people=${current.length} default_people=${defaults.length}`);
