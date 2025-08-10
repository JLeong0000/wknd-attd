import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";
import { ChangeBuffer, PersonData } from "../types";

// Get all people
export const getPeople = async () => {
    const { data: currentPeople, error: errorCurr } = await supabase
        .from("current_people")
        .select("*");
    const { data: defaultPeople, error: errorDef } = await supabase
        .from("default_people")
        .select("*");

    if (errorCurr) throw errorCurr;
    if (errorDef) throw errorDef;

    return {
        currentPeople: currentPeople || [],
        defaultPeople: defaultPeople || [],
    };
};

// Insert 1 into current people
export const addOneCurrPpl = async (person: PersonData) => {
    const { data, error } = await supabase
        .from("current_people")
        .insert(person)
        .select();

    error
        ? console.error("Error inserting: " + person.name, error)
        : console.log("Inserted:", person.name);
};

// Update 1 from current people
export const updateOneCurrPpl = async (person: PersonData) => {
    const { data, error } = await supabase
        .from("current_people")
        .update(person)
        .eq("id", person.id)
        .select();

    error
        ? console.error("Error updating: " + person.name, error)
        : console.log("Updated:", person.name);
};

// Delete 1 from current people
export const deleteOneCurrPpl = async (id: string) => {
    const { data, error } = await supabase
        .from("current_people")
        .delete()
        .eq("id", id);

    error
        ? console.error("Error deleting: " + data, error)
        : console.log("Deleted:", data);
};

// Reset current people
export const postCurrPpl = async (
    people: PersonData[],
    changeBuffer: ChangeBuffer
) => {
    changeBuffer.origin = true;

    // Clear table first
    await supabase.from("current_people").delete().neq("id", 0);

    const { data, error } = await supabase
        .from("current_people")
        .insert(people)
        .select();

    if (error) {
        console.error("Error saving current people", people, error);
        alert("Failed to save");
        return false;
    } else {
        console.log("Successfully reset current people");
        return true;
    }
};

// Save default people
export const postDefPpl = async (
    people: PersonData[],
    changeBuffer: ChangeBuffer
) => {
    changeBuffer.origin = true;

    // Clear table first
    await supabase.from("default_people").delete().neq("id", 0);

    const { data, error } = await supabase
        .from("default_people")
        .insert(people)
        .select();

    if (error) {
        console.error("Error saving default people", people, error);
        alert("Failed to save");
        return false;
    } else {
        console.log("Successfully reset default people");
        return true;
    }
};

export const SupabaseChangeListener = (changeBuffer: ChangeBuffer) => {
    const processChanges = () => {
        if (changeBuffer.payloads.length > 0) {
            console.log("Batch changes detected:", changeBuffer.payloads);

            if (!changeBuffer.origin) {
                alert("Data has been updated. Please reload page ✨");
                changeBuffer.payloads = [];
                changeBuffer.origin = false;
            }
        }
    };

    return supabase
        .channel("supabase-global-listener")
        .on(
            "postgres_changes",
            {
                event: "*",
                schema: "public",
            },
            (payload) => {
                // Clear existing timer if it exists
                if (changeBuffer.timer) {
                    clearTimeout(changeBuffer.timer);
                }

                // Add new payload to buffer
                changeBuffer.payloads.push(payload);

                // Set new timer
                changeBuffer.timer = setTimeout(processChanges, 500);
            }
        )
        .subscribe();
};
