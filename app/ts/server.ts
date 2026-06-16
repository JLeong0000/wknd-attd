import { supabase } from "../lib/supabaseClient";
import { ChangeBuffer, Group, PersonData } from "../types";

export const getGroups = async (): Promise<Group[]> => {
    const { data, error } = await supabase
        .from("groups")
        .select("*")
        .order("sort_order");

    if (error) throw error;
    return data ?? [];
};

export const getPeople = async (groupKey: string) => {
    const { data: currentPeople, error: errorCurr } = await supabase
        .from("current_people")
        .select("*")
        .eq("group", groupKey);
    const { data: defaultPeople, error: errorDef } = await supabase
        .from("default_people")
        .select("*")
        .eq("group", groupKey);

    if (errorCurr) throw errorCurr;
    if (errorDef) throw errorDef;

    const sortByName = (a: PersonData, b: PersonData) =>
        a.name.localeCompare(b.name);

    return {
        currentPeople: (currentPeople ?? []).sort(sortByName),
        defaultPeople: (defaultPeople ?? []).sort(sortByName),
    };
};

export const postCurrPpl = async (
    people: PersonData[],
    changeBuffer: ChangeBuffer,
    groupKey: string
) => {
    changeBuffer.origin = true;

    await supabase.from("current_people").delete().eq("group", groupKey);

    const { error } = await supabase
        .from("current_people")
        .insert(people.map(p => ({ ...p, group: groupKey })))
        .select();

    if (error) {
        console.error("Error saving current people", people, error);
        alert("Failed to save");
        return false;
    }
    return true;
};

export const postDefPpl = async (
    people: PersonData[],
    changeBuffer: ChangeBuffer,
    groupKey: string
) => {
    changeBuffer.origin = true;

    await supabase.from("default_people").delete().eq("group", groupKey);

    const { error } = await supabase
        .from("default_people")
        .insert(people.map(p => ({ ...p, group: groupKey })))
        .select();

    if (error) {
        console.error("Error saving default people", people, error);
        alert("Failed to save");
        return false;
    }
    return true;
};

export const SupabaseChangeListener = (changeBuffer: ChangeBuffer, groupKey: string) => {
    const processChanges = () => {
        if (changeBuffer.payloads.length > 0) {
            console.log("Batch changes detected:", changeBuffer.payloads);

            if (!changeBuffer.origin) {
                alert("Data has been updated. Please reload page ✨");
                changeBuffer.payloads = [];
            }

            changeBuffer.origin = false;
        }
    };

    return supabase
        .channel(`supabase-listener-${groupKey}`)
        .on(
            "postgres_changes",
            {
                event: "*",
                schema: "public",
                table: "current_people",
                filter: `group=eq.${groupKey}`,
            },
            (payload) => {
                if (changeBuffer.timer) clearTimeout(changeBuffer.timer);
                changeBuffer.payloads.push(payload);
                changeBuffer.timer = setTimeout(processChanges, 500);
            }
        )
        .on(
            "postgres_changes",
            {
                event: "*",
                schema: "public",
                table: "default_people",
                filter: `group=eq.${groupKey}`,
            },
            (payload) => {
                if (changeBuffer.timer) clearTimeout(changeBuffer.timer);
                changeBuffer.payloads.push(payload);
                changeBuffer.timer = setTimeout(processChanges, 500);
            }
        )
        .subscribe();
};
