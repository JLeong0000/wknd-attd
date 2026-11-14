CREATE TABLE IF NOT EXISTS groups (
    key TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS current_people (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL,
    "group" TEXT NOT NULL REFERENCES groups(key)
);
CREATE INDEX IF NOT EXISTS current_people_group ON current_people("group");

CREATE TABLE IF NOT EXISTS default_people (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL,
    "group" TEXT NOT NULL REFERENCES groups(key)
);
CREATE INDEX IF NOT EXISTS default_people_group ON default_people("group");
