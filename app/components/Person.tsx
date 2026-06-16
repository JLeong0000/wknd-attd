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
            className="flex items-center justify-between gap-2 px-4 min-h-[52px]"
        >
            <input
                ref={inputRef}
                id={"name_" + person.id}
                value={person.name}
                onChange={handleNameChangeEvent}
                onKeyDown={handleKeyDown}
                placeholder="Name"
                className={`flex-1 min-w-0 bg-transparent py-3 text-[17px] font-medium outline-none placeholder:text-label-secondary/60
                    ${isEditing ? "text-accent" : "text-label"}`}
            />

            <div className="flex items-center justify-end gap-1 shrink-0">
                <select
                    id={"select_" + person.id}
                    value={person.status}
                    onChange={handleStatusChangeEvent}
                    className={`py-1.5 pl-3 pr-2 rounded-lg bg-fill-secondary text-[15px] font-medium outline-none focus:ring-2 focus:ring-accent cursor-pointer
                        ${isEditing ? "text-accent" : "text-label-secondary"}`}
                >
                    {STATUSENUM.map((stat) => (
                        <option key={stat} value={stat} className="text-label bg-surface">
                            {stat}
                        </option>
                    ))}
                </select>
                <button
                    onClick={() => deletePerson(person.id)}
                    aria-label={"Delete " + (person.name || "person")}
                    className="p-2 rounded-full cursor-pointer text-label-secondary/70 hover:text-destructive hover:bg-fill-secondary active:text-destructive transition-colors"
                >
                    <IoTrashBinSharp />
                </button>
            </div>
        </div>
    );
};

export default Person;
