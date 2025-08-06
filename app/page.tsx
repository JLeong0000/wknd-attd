"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { unicodeFormat, generateId, copyGenerate } from "./ts/helper";
import { getPeople, postCurrentPpl, postDefaultPpl } from "./ts/server";
import { IoPersonAddSharp } from "react-icons/io5";

import Person from "./components/Person";
import { PersonData } from "./types";

const Home: React.FC = () => {
    const [currentPpl, setCurrentPpl] = useState<PersonData[]>([]);
    const [defaultPpl, setDefaultPpl] = useState<PersonData[]>([]);
    const [tempDefPpl, setTempDefPpl] = useState<PersonData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currModified, setCurrModified] = useState(false);
    const [tempModified, setTempModified] = useState(false);

    const initPpl = useCallback(async () => {
        console.log("Starting data fetch");
        try {
            const data = await getPeople();
            setCurrentPpl(data.currentPeople);
            setDefaultPpl(data.defaultPeople);
        } catch (error) {
            console.error("Fetch failed:", error);
        }
    }, []);

    const startEditing = () => {
        if (isEditing) {
            setTempModified(false);
            setIsEditing(false);
        } else {
            setTempDefPpl(defaultPpl);
            setIsEditing(true);
        }
    };

    const resetCurrPpl = () => {
        setCurrModified(true);
        setCurrentPpl(defaultPpl);
    };

    const updateDefault = async (): Promise<void> => {
        setDefaultPpl(tempDefPpl);
        postDefaultPpl(tempDefPpl);
        setIsEditing(false);
    };

    const saveCurrent = async (): Promise<void> => {
        setCurrModified(false);
        postCurrentPpl(currentPpl);
    };

    const handleStatusChange = useCallback(
        (id: string, newStatus: string, isEditing: boolean) => {
            if (isEditing) {
                setTempModified(true);
                setTempDefPpl((prev) =>
                    prev?.map((person) =>
                        person.id === id
                            ? { ...person, status: newStatus }
                            : person
                    )
                );
            } else {
                setCurrModified(true);
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
                setTempModified(true);
                setTempDefPpl((prev) =>
                    prev?.map((person) =>
                        person.id === id ? { ...person, name: newName } : person
                    )
                );
            } else {
                setCurrModified(true);
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
            setTempModified(true);
            setTempDefPpl((prev) => [...(prev || []), newPerson]);
        } else {
            setCurrModified(true);
            setCurrentPpl((prev) => [...(prev || []), newPerson]);
        }
    };

    const deletePerson = (id: string) => {
        if (isEditing) {
            setTempModified(true);
            setTempDefPpl((prev) => prev?.filter((person) => person.id !== id));
        } else {
            setCurrModified(true);
            setCurrentPpl((prev) => prev?.filter((person) => person.id !== id));
        }
    };

    const editingPeople = useMemo(() => {
        if (defaultPpl.length == 0) return;
        return tempDefPpl?.map((person) => (
            <Person
                key={person.id}
                person={person}
                handleStatusChange={handleStatusChange}
                handleNameChange={handleNameChange}
                deletePerson={deletePerson}
                isEditing={true}
            />
        ));
    }, [tempDefPpl, handleStatusChange, handleNameChange]);

    const currentPeople = useMemo(() => {
        if (currentPpl.length == 0) return;
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

    useEffect(() => {
        initPpl();
    }, [initPpl]);

    useEffect(() => {
        console.log("CurrentPpl updated:", currentPpl);
    }, [currentPpl]);

    useEffect(() => {
        console.log("DefaultPpl updated:", defaultPpl);
    }, [defaultPpl]);

    return (
        <main>
            <div className="min-h-screen my-auto flex items-center justify-center">
                <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-4 space-y-7 sm:my-10">
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
                            onClick={resetCurrPpl}
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
                            className={`w-full bg-indigo-900 hover:bg-indigo-800 font-bold py-2 px-4 rounded-lg cursor-pointer 
								${isEditing ? "text-blue-400" : "text-white"} `}
                        >
                            {isEditing ? "Editing" : "Edit Default"}
                        </button>
                    </div>

                    <div className="space-y-3">
                        {isEditing ? editingPeople : currentPeople}

                        <button
                            onClick={addPerson}
                            className="flex items-center justify-center w-full p-3 text-xl text-zinc-500 rounded-lg cursor-pointer border border-slate-200 bg-slate-100 hover:bg-slate-200"
                        >
                            <IoPersonAddSharp />
                        </button>
                    </div>

                    {isEditing ? (
                        <button
                            onClick={updateDefault}
                            disabled={!tempModified}
                            className={`w-full text-white font-bold py-3 px-4 rounded-lg cursor-pointer active:scale-95 transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                                ${
                                    tempModified
                                        ? "bg-violet-600 hover:bg-violet-700"
                                        : "bg-zinc-700"
                                }
                                `}
                        >
                            Update Default
                        </button>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={saveCurrent}
                                disabled={!currModified}
                                className={`w-full text-white font-bold py-3 px-4 rounded-lg cursor-pointer bg-violet-600 hover:bg-violet-700 active:scale-95 transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                                    ${
                                        currModified
                                            ? "bg-violet-600 hover:bg-violet-700"
                                            : "bg-zinc-700"
                                    }`}
                            >
                                Save Current
                            </button>
                            <button
                                onClick={() => copyGenerate(currentPpl)}
                                className="w-full text-white font-bold py-3 px-4 rounded-lg cursor-pointer bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Generate Message
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};

export default Home;
