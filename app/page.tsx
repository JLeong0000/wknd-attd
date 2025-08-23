"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { generateId, copyGenerate } from "./ts/helper";
import {
    getPeople,
    postCurrPpl,
    postDefPpl,
    SupabaseChangeListener,
} from "./ts/server";
import { IoPersonAddSharp } from "react-icons/io5";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

import Person from "./components/Person";
import { ChangeBuffer, PersonData } from "./types";
import { supabase } from "./lib/supabaseClient";

const Home: React.FC = () => {
    const [currentPpl, setCurrentPpl] = useState<PersonData[]>([]);
    const [defaultPpl, setDefaultPpl] = useState<PersonData[]>([]);
    const [tempDefPpl, setTempDefPpl] = useState<PersonData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currModified, setCurrModified] = useState(false);
    const [tempModified, setTempModified] = useState(false);

    const [changeBuffer] = useState<ChangeBuffer>({
        timer: null,
        payloads: [],
        origin: false,
    });

    const initPpl = useCallback(async () => {
        const { currentPeople, defaultPeople } = await getPeople();
        setCurrentPpl(currentPeople);
        setDefaultPpl(defaultPeople);

        setIsLoading(false);
    }, []);

    const toggleEditing = () => {
        if (isEditing) {
            setIsEditing(false);
        } else {
            setTempDefPpl(defaultPpl);
            setIsEditing(true);
        }
    };

    const resetCurrent = () => {
        setCurrModified(true);
        setCurrentPpl(defaultPpl);
    };

    const updateDefault = async (): Promise<void> => {
        setIsSaving(true);
        setDefaultPpl(tempDefPpl);

        const saveStatus = await postDefPpl(tempDefPpl, changeBuffer);
        setIsSaving(false);
        setIsEditing(!saveStatus);
    };

    const saveCurrent = async (): Promise<void> => {
        setIsSaving(true);
        setCurrModified(false);
        await postCurrPpl(currentPpl, changeBuffer);
        setIsSaving(false);
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
            status: "S2: Sitting",
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
        if (tempDefPpl.length == 0) return;
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
        const channel = SupabaseChangeListener(changeBuffer);

        return () => {
            if (channel) supabase.removeChannel(channel);
            if (changeBuffer.timer) clearTimeout(changeBuffer.timer);
        };

        changeBuffer.payloads = [];
    }, [initPpl, changeBuffer]);

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
                            onClick={resetCurrent}
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
                            onClick={() => toggleEditing()}
                            className={`w-full bg-indigo-900 hover:bg-indigo-800 font-bold py-2 px-4 rounded-lg cursor-pointer 
								${isEditing ? "text-blue-400" : "text-white"} `}
                        >
                            {isEditing ? "Editing" : "Edit Default"}
                        </button>
                    </div>

                    <div className="space-y-3">
                        {isLoading && (
                            <div className="flex items-center justify-center px-3 py-4 text-zinc-600 tracking-widest text-xs font-bold bg-slate-300 rounded-lg border border-slate-200 animate-pulse">
                                FETCHING PEOPLE FROM MRT
                            </div>
                        )}
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
                            className={`flex justify-center w-full text-white font-bold py-3 px-4 rounded-lg transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                                ${
                                    tempModified
                                        ? "bg-violet-600 hover:bg-violet-700 active:scale-95 cursor-pointer"
                                        : "bg-zinc-700"
                                }
                                `}
                        >
                            {isSaving ? (
                                <AiOutlineLoading3Quarters className="animate-spin text-2xl" />
                            ) : (
                                "Update Default"
                            )}
                        </button>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={saveCurrent}
                                disabled={!currModified}
                                className={`flex justify-center w-full text-white font-bold py-3 px-4 rounded-lg transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                                    ${
                                        currModified
                                            ? "bg-violet-600 hover:bg-violet-700 active:scale-95 cursor-pointer"
                                            : "bg-zinc-700"
                                    }`}
                            >
                                {isSaving ? (
                                    <AiOutlineLoading3Quarters className="animate-spin text-2xl" />
                                ) : (
                                    "Save"
                                )}
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
