"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { unicodeFormat } from "./ts/helper";
import { getCurrentPpl } from "./ts/app";
import { IoPersonAddSharp } from "react-icons/io5";

import Person from "./components/Person";
import { PersonData } from "./types";

const generateId = () => Math.random().toString(36).substring(2, 9);

const Home: React.FC = () => {
    const [currentPpl, setCurrentPpl] = useState<PersonData[] | undefined>([
        {
            id: generateId(),
            name: "John Doe",
            status: "Serving",
        },
        {
            id: generateId(),
            name: "Jane Smith",
            status: "Core",
        },
    ]);
    const [defaultPpl, setDefaultPpl] = useState<PersonData[] | undefined>([
        {
            id: generateId(),
            name: "Michael Johnson",
            status: "Sitting",
        },
        {
            id: generateId(),
            name: "Emily Davis",
            status: "Others",
        },
    ]);
    const [tempDefaultPpl, setTempDefaultPpl] = useState<
        PersonData[] | undefined
    >();
    const [isEditing, setIsEditing] = useState<boolean>(false);

    const startEditing = () => {
        if (isEditing) {
            setIsEditing(false);
        } else {
            setTempDefaultPpl(defaultPpl);
            setIsEditing(true);
        }
    };

    const updateDefault = (): void => {
        console.log("Implement save to store");
        setDefaultPpl(tempDefaultPpl);
        setIsEditing(false);
    };

    const handleStatusChange = useCallback(
        (id: string, newStatus: string, isEditing: boolean) => {
            if (isEditing) {
                setTempDefaultPpl((prev) =>
                    prev?.map((person) =>
                        person.id === id
                            ? { ...person, status: newStatus }
                            : person
                    )
                );
            } else {
                setCurrentPpl((prev) =>
                    prev?.map((person) =>
                        person.id === id
                            ? { ...person, status: newStatus }
                            : person
                    )
                );
            }
        },
        []
    );

    const handleNameChange = useCallback(
        (id: string, newName: string, isEditing: boolean) => {
            if (isEditing) {
                setTempDefaultPpl((prev) =>
                    prev?.map((person) =>
                        person.id === id ? { ...person, name: newName } : person
                    )
                );
            } else {
                setCurrentPpl((prev) =>
                    prev?.map((person) =>
                        person.id === id ? { ...person, name: newName } : person
                    )
                );
            }
        },
        []
    );

    const addPerson = () => {
        const newPerson = {
            id: generateId(),
            name: "",
            status: "Sitting",
        };

        if (isEditing) {
            setDefaultPpl((prev) => [...(prev || []), newPerson]);
        } else {
            setCurrentPpl((prev) => [...(prev || []), newPerson]);
        }
    };

    const deletePerson = (id: string) => {
        if (isEditing) {
            setDefaultPpl((prev) => prev?.filter((person) => person.id !== id));
        } else {
            setCurrentPpl((prev) => prev?.filter((person) => person.id !== id));
        }
    };

    const editingPeople = useMemo(() => {
        return tempDefaultPpl?.map((person) => (
            <Person
                key={person.id}
                person={person}
                handleStatusChange={handleStatusChange}
                handleNameChange={handleNameChange}
                deletePerson={deletePerson}
                isEditing={true}
            />
        ));
    }, [tempDefaultPpl, handleStatusChange, handleNameChange]);

    const currentPeople = useMemo(() => {
        return currentPpl?.map((person) => (
            <Person
                key={person.id}
                person={person}
                handleStatusChange={handleStatusChange}
                handleNameChange={handleNameChange}
                deletePerson={deletePerson}
                isEditing={false}
            />
        ));
    }, [currentPpl, handleStatusChange, handleNameChange]);

    const copyGenerate = (): void => {
        if (!currentPpl) return;

        const sitting = currentPpl
            .filter((p) => p.status === "Sitting" && p.name)
            .map((p) => p.name);
        const serving = currentPpl
            .filter((p) => p.status === "Serving" && p.name)
            .map((p) => p.name);
        const alwaysServing = currentPpl
            .filter((p) => p.status === "Core" && p.name)
            .map((p) => p.name);
        const others = currentPpl
            .filter((p) => p.status === "Others" && p.name)
            .map((p) => p.name);

        const headerText = unicodeFormat("Service 2 Attendance", "bold");
        let message = headerText + "\n\n";

        if (sitting.length > 0) {
            message += `Sitting: (${sitting.length})\n- ${sitting.join(
                ", "
            )}\n\n`;
        }
        if (serving.length > 0 || alwaysServing.length > 0) {
            const allServing = [...serving, ...alwaysServing];
            message += `Serving: (${allServing.length})\n- ${allServing.join(
                ", "
            )}\n\n`;
        }
        if (others.length > 0) {
            message += `Others: (${others.length})\n- ${others.join(", ")}\n\n`;
        }

        navigator.clipboard.writeText(message.trim()).then(
            () => alert("Message copied to clipboard!"),
            (err) => console.error("Failed to copy message: ", err)
        );
    };

    useEffect(() => {
        console.log("currentPpl", currentPpl);
    }, [currentPpl]);

    useEffect(() => {
        console.log("defaultPpl", defaultPpl);
    }, [defaultPpl]);

    useEffect(() => {
        console.log("tempDefaultPpl", tempDefaultPpl);
    }, [tempDefaultPpl]);

    return (
        <main>
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-4 space-y-7">
                    <header>
                        <p className="text-4xl font-bold text-slate-800 text-center">
                            Attendance Generator
                        </p>
                        <p className="text-center text-slate-500 mt-1">
                            Update status for each person
                        </p>
                    </header>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPpl(defaultPpl)}
                            disabled={isEditing}
                            className={`w-full text-white font-bold py-2 px-4 rounded-lg ${
                                isEditing
                                    ? "bg-zinc-700"
                                    : "bg-red-800 hover:bg-red-700 cursor-pointer"
                            } `}
                        >
                            Reset
                        </button>
                        <button
                            onClick={() => startEditing()}
                            className={`w-full bg-slate-800 hover:bg-slate-700 font-bold py-2 px-4 rounded-lg cursor-pointer 
								${isEditing ? "text-blue-400" : "text-white"} `}
                        >
                            {isEditing ? "Editing" : "Edit Default"}
                        </button>
                    </div>

                    <div className="space-y-3">
                        {isEditing ? editingPeople : currentPeople}

                        <button
                            onClick={addPerson}
                            className="flex items-center justify-center w-full p-3 text-zinc-500 rounded-lg cursor-pointer border border-slate-200 bg-slate-100 hover:bg-slate-200"
                        >
                            <IoPersonAddSharp />
                        </button>
                    </div>

                    {isEditing ? (
                        <button
                            onClick={updateDefault}
                            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg cursor-pointer hover:bg-blue-700 active:scale-95 transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Update Default
                        </button>
                    ) : (
                        <button
                            onClick={copyGenerate}
                            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg cursor-pointer hover:bg-blue-700 active:scale-95 transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Generate and Copy Message
                        </button>
                    )}
                </div>
            </div>
        </main>
    );
};

export default Home;
