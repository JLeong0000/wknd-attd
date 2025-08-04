import React from "react";
import { STATUSENUM } from "../ts/enums";
import { PersonData } from "../types";

interface PersonProps {
    person: PersonData;
    handleStatusChange: (
        id: string,
        newStatus: string,
        isEditing: boolean
    ) => void;
    handleNameChange: (id: string, newName: string, isEditing: boolean) => void;
    isEditing: boolean;
}

const Person: React.FC<PersonProps> = ({
    person,
    handleStatusChange,
    handleNameChange,
    isEditing,
}) => {
    const handleNameChangeEvent = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleNameChange(person.id, e.target.value, isEditing);
    };

    const handleStatusChangeEvent = (
        e: React.ChangeEvent<HTMLSelectElement>
    ) => {
        handleStatusChange(person.id, e.target.value, isEditing);
    };

    return (
        <div
            key={person.name + "_" + person.id}
            className={`flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 
				${isEditing ? "text-blue-500" : ""}`}
        >
            <input
                id={person.id}
                defaultValue={person.name}
                onChange={handleNameChangeEvent}
                className={`text-lg font-medium 
					${isEditing ? "text-blue-500" : "text-slate-700"}`}
            />

            <select
                value={person.status}
                onChange={handleStatusChangeEvent}
                className={`w-40 p-2 border border-slate-300 rounded-md shadow-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
					${isEditing ? "text-blue-500" : "text-black"}`}
            >
                {STATUSENUM.map((stat) => (
                    <option key={stat} value={stat} className="pr-2">
                        {stat}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default Person;
