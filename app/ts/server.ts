import { supabase } from "../lib/supabaseClient";
import { PersonData } from "../types";

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
export const postCurrPpl = async (people: PersonData[]) => {
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
export const postDefPpl = async (people: PersonData[]) => {
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

export const currentPplChangeListener = async () => {
    const channels = supabase
        .channel("currentPpl-channel")
        .on(
            "postgres_changes",
            { event: "DELETE", schema: "public", table: "current_people" },
            (payload) => {
                alert("Current people has been updated. Please reload page ✨");
                console.log("Current people table updated", payload);
            }
        )
        .subscribe();
};

export const defaultPplChangeListener = async () => {
    const channels = supabase
        .channel("defaultPpl-channel")
        .on(
            "postgres_changes",
            { event: "DELETE", schema: "public", table: "default_people" },
            (payload) => {
                alert("Default people has been updated. Please reload page ✨");
                console.log("Default people table updated", payload);
            }
        )
        .subscribe();
};
