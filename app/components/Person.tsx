"use client";

import React, { useEffect, useRef } from "react";
import { STATUSENUM } from "../ts/enums";
import { PersonData } from "../types";
import { IoTrashBinSharp } from "react-icons/io5";

interface PersonProps {
    person: PersonData;
    handleStatusChange: (
        id: string,
        newStatus: string,
        isEditing: boolean
    ) => void;
    handleNameChange: (id: string, newName: string, isEditing: boolean) => void;
    deletePerson: (id: string) => void;
    isEditing: boolean;
}

const Person: React.FC<PersonProps> = ({
    person,
    handleStatusChange,
    handleNameChange,
    deletePerson,
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

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            inputRef.current?.blur();
        }
    };

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (inputRef.current) inputRef.current.focus();
    }, [person.name]);

    return (
        <div
            key={"container_" + person.id}
            className={`flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 
				${isEditing ? "text-blue-500" : ""}`}
        >
            <input
                ref={inputRef}
                id={"name_" + person.id}
                value={person.name}
                onChange={handleNameChangeEvent}
                onKeyDown={handleKeyDown}
                className={`p-1 text-lg font-medium min-w-0
					${isEditing ? "text-blue-500" : "text-slate-700"}`}
            />

            <div className="flex items-center justify-end ml-2 w-full min-w-[135px] max-w-[200px]">
                <select
                    id={"select_" + person.id}
                    value={person.status}
                    onChange={handleStatusChangeEvent}
                    className={`p-2 w-full border border-slate-300 rounded-md shadow-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
					${isEditing ? "text-blue-500" : "text-black"}`}
                >
                    {STATUSENUM.map((stat) => (
                        <option key={stat} value={stat} className="">
                            {stat}
                        </option>
                    ))}
                </select>
                <button
                    onClick={() => deletePerson(person.id)}
                    className="ml-2 p-2 rounded-md cursor-pointer text-red-500 hover:bg-slate-200"
                >
                    <IoTrashBinSharp />
                </button>
            </div>
        </div>
    );
};

export default Person;
