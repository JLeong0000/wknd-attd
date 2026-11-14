"use server";

import { db } from "../lib/db";
import { Group, PersonData } from "../types";

export const getGroups = async (): Promise<Group[]> => {
    const { rows } = await db.execute("SELECT key, label, sort_order FROM groups ORDER BY label");
    return rows.map(r => ({
        key: String(r.key),
        label: String(r.label),
        sort_order: Number(r.sort_order),
    }));
};

const selectPeople = async (table: "current_people" | "default_people", groupKey: string) => {
    const { rows } = await db.execute({
        sql: `SELECT id, name, status FROM ${table} WHERE "group" = ?`,
        args: [groupKey],
    });
    return rows.map(r => ({ id: String(r.id), name: String(r.name ?? ""), status: String(r.status) }));
};

export const getPeople = async (groupKey: string) => {
    const [currentPeople, defaultPeople] = await Promise.all([
        selectPeople("current_people", groupKey),
        selectPeople("default_people", groupKey),
    ]);

    const sortByName = (a: PersonData, b: PersonData) =>
        a.name.localeCompare(b.name);

    return {
        currentPeople: currentPeople.sort(sortByName),
        defaultPeople: defaultPeople.sort(sortByName),
    };
};

// Full replace of the group's rows, in one transaction.
const replacePeople = async (
    table: "current_people" | "default_people",
    people: PersonData[],
    groupKey: string
) => {
    try {
        await db.batch(
            [
                { sql: `DELETE FROM ${table} WHERE "group" = ?`, args: [groupKey] },
                ...people.map(p => ({
                    sql: `INSERT INTO ${table} (id, name, status, "group") VALUES (?, ?, ?, ?)`,
                    args: [p.id, p.name, p.status, groupKey],
                })),
            ],
            "write"
        );
        return true;
    } catch (error) {
        console.error(`Error saving ${table}`, people, error);
        return false;
    }
};

export const postCurrPpl = async (people: PersonData[], groupKey: string) =>
    replacePeople("current_people", people, groupKey);

export const postDefPpl = async (people: PersonData[], groupKey: string) =>
    replacePeople("default_people", people, groupKey);
