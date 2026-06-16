"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { generateId, unicodeFormat } from "../ts/helper";
import { getPeople, postCurrPpl, postDefPpl, SupabaseChangeListener } from "../ts/server";
import { IoPersonAddSharp, IoChevronForward, IoSearch, IoCloseCircle } from "react-icons/io5";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

import Person from "./Person";
import { ChangeBuffer, PersonData } from "../types";
import { supabase } from "../lib/supabaseClient";

interface AttendanceProps {
    groupKey: string;
    groupLabel: string;
    onSwitchGroup: () => void;
}

const Attendance: React.FC<AttendanceProps> = ({ groupKey, groupLabel, onSwitchGroup }) => {
    const [currentPpl, setCurrentPpl] = useState<PersonData[]>([]);
    const [defaultPpl, setDefaultPpl] = useState<PersonData[]>([]);
    const [tempDefPpl, setTempDefPpl] = useState<PersonData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currModified, setCurrModified] = useState(false);
    const [tempModified, setTempModified] = useState(false);
    const [sortBy, setSortBy] = useState<"name" | "status">("name");
    const [search, setSearch] = useState("");

    const [changeBuffer] = useState<ChangeBuffer>({
        timer: null,
        payloads: [],
        origin: false,
    });

    const initPpl = useCallback(async () => {
        setIsLoading(true);
        const { currentPeople, defaultPeople } = await getPeople(groupKey);
        setCurrentPpl(currentPeople);
        setDefaultPpl(defaultPeople);
        setIsLoading(false);
        setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
    }, [groupKey]);

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
        const saveStatus = await postDefPpl(tempDefPpl, changeBuffer, groupKey);
        setIsSaving(false);
        setIsEditing(!saveStatus);
    };

    const saveCurrent = async (): Promise<void> => {
        setIsSaving(true);
        setCurrModified(false);
        await postCurrPpl(currentPpl, changeBuffer, groupKey);
        setIsSaving(false);
    };

    const handleStatusChange = useCallback((id: string, newStatus: string, isEditing: boolean) => {
        if (isEditing) {
            setTempModified(true);
            setTempDefPpl(prev => prev?.map(person => (person.id === id ? { ...person, status: newStatus } : person)));
        } else {
            setCurrModified(true);
            setCurrentPpl(prev => prev?.map(person => (person.id === id ? { ...person, status: newStatus } : person)));
        }
    }, []);

    const handleNameChange = useCallback((id: string, newName: string, isEditing: boolean) => {
        if (isEditing) {
            setTempModified(true);
            setTempDefPpl(prev => prev?.map(person => (person.id === id ? { ...person, name: newName } : person)));
        } else {
            setCurrModified(true);
            setCurrentPpl(prev => prev?.map(person => (person.id === id ? { ...person, name: newName } : person)));
        }
    }, []);

    const copyGenerate = (currentPpl?: PersonData[]): void => {
        saveCurrent();
        if (!currentPpl) return;

        const headerText = unicodeFormat("Attendance", "bold");
        let message = headerText + "\n\n";

        const sittingS2 = currentPpl.filter(p => p.status.includes("S2: Sitting") && p.name).map(p => p.name);
        if (sittingS2.length > 0) message += `S2: (${sittingS2.length})\n- ${sittingS2.join(", ")}\n\n`;

        const serving = currentPpl.filter(p => p.status === "Serving" && p.name).map(p => p.name);
        const alwaysServing = currentPpl.filter(p => p.status === "Always Serving" && p.name).map(p => p.name);
        if (serving.length > 0 || alwaysServing.length > 0) {
            const allServing = [...serving, ...alwaysServing];
            message += `Serving: (${allServing.length})\n- ${serving.join(", ")}\n- ${alwaysServing.join(", ")}\n\n`;
        }

        const tbc = currentPpl.filter(p => p.status === "TBC" && p.name).map(p => p.name);
        if (tbc.length > 0) message += `TBC: (${tbc.length})\n- ${tbc.join(", ")}\n\n`;

        const others = currentPpl.filter(p => p.status === "Others" && p.name).map(p => p.name);
        if (others.length > 0) message += `OTH: (${others.length})\n- ${others.join(", ")}\n\n`;

        const sittingS13 = currentPpl.filter(p => p.status.includes("S1: Sitting") || (p.status.includes("S3: Sitting") && p.name)).map(p => p.name);
        if (sittingS13.length > 0) message += `S1/S3: (${sittingS13.length})\n- ${sittingS13.join(", ")}\n\n`;

        navigator.clipboard.writeText(message.trim()).then(
            () => alert("Message copied to clipboard!"),
            err => console.error("Failed to copy message: ", err),
        );
    };

    const addPerson = () => {
        setSearch("");
        const newPerson = { id: generateId(), name: "", status: "S2: Sitting" };
        if (isEditing) {
            setTempModified(true);
            setTempDefPpl(prev => [...(prev || []), newPerson]);
        } else {
            setCurrModified(true);
            setCurrentPpl(prev => [...(prev || []), newPerson]);
        }
    };

    const deletePerson = (id: string) => {
        if (isEditing) {
            setTempModified(true);
            setTempDefPpl(prev => prev?.filter(person => person.id !== id));
        } else {
            setCurrModified(true);
            setCurrentPpl(prev => prev?.filter(person => person.id !== id));
        }
    };

    const setSort = (newSortBy: "name" | "status") => {
        if (newSortBy === sortBy) return;
        setSortBy(newSortBy);

        if (newSortBy === "status") {
            setCurrentPpl(prev => [...prev].sort((a, b) => a.status.localeCompare(b.status)).reverse());
            setDefaultPpl(prev => [...prev].sort((a, b) => a.status.localeCompare(b.status)).reverse());
            if (tempDefPpl.length > 0) setTempDefPpl(prev => [...prev].sort((a, b) => a.status.localeCompare(b.status)).reverse());
        } else {
            setCurrentPpl(prev => [...prev].sort((a, b) => a.name.localeCompare(b.name)));
            setDefaultPpl(prev => [...prev].sort((a, b) => a.name.localeCompare(b.name)));
            if (tempDefPpl.length > 0) setTempDefPpl(prev => [...prev].sort((a, b) => a.name.localeCompare(b.name)));
        }

        setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
    };

    const filteredPeople = useMemo(() => {
        const source = isEditing ? tempDefPpl : currentPpl;
        const q = search.trim().toLowerCase();
        return q ? source.filter(p => p.name.toLowerCase().includes(q)) : source;
    }, [isEditing, tempDefPpl, currentPpl, search]);

    useEffect(() => {
        initPpl();
        const channel = SupabaseChangeListener(changeBuffer, groupKey);
        return () => {
            if (channel) supabase.removeChannel(channel);
            if (changeBuffer.timer) clearTimeout(changeBuffer.timer);
            changeBuffer.payloads = [];
        };
    }, [initPpl, changeBuffer, groupKey]);

    const primaryBtn =
        "flex items-center justify-center w-full h-[52px] rounded-2xl text-[17px] font-semibold transition-all duration-150 ease-out active:scale-[0.98] cursor-pointer disabled:cursor-default disabled:active:scale-100";

    const segment = (value: "name" | "status", label: string) => (
        <button
            onClick={() => setSort(value)}
            className={`px-5 py-1.5 rounded-full text-[15px] font-semibold transition-all duration-150 cursor-pointer ${
                sortBy === value ? "bg-surface text-label shadow-sm" : "text-label-secondary"
            }`}
        >
            {label}
        </button>
    );

    return (
        <main className="min-h-screen flex flex-col items-center px-5 py-8 bg-app">
            <div className="w-full max-w-md md:max-w-4xl space-y-6">
                <header className="space-y-3 px-1">
                    <div className="flex items-center justify-between">
                        <span className="inline-flex items-center rounded-full bg-accent-fill text-accent px-3 py-1 text-[13px] font-bold tracking-wide uppercase">
                            {groupLabel}
                        </span>
                        <button
                            onClick={onSwitchGroup}
                            className="inline-flex items-center gap-0.5 text-accent text-[15px] font-medium hover:opacity-70 transition-opacity cursor-pointer"
                        >
                            Switch
                            <IoChevronForward className="text-sm" />
                        </button>
                    </div>
                    <div>
                        <h1 className="font-heading text-[34px] leading-tight font-extrabold tracking-tight text-label">
                            Attendance
                        </h1>
                        <p className="text-label-secondary text-[15px] mt-0.5">Update status for each person</p>
                    </div>
                </header>

                <div className="grid grid-cols-2 gap-2.5">
                    <button
                        onClick={resetCurrent}
                        disabled={isEditing}
                        className="flex items-center justify-center h-11 rounded-2xl bg-fill-secondary text-[15px] font-semibold text-destructive transition-all duration-150 ease-out active:scale-[0.98] cursor-pointer disabled:opacity-40 disabled:active:scale-100 disabled:cursor-default"
                    >
                        Reset
                    </button>
                    <button
                        onClick={toggleEditing}
                        className={`flex items-center justify-center h-11 rounded-2xl text-[15px] font-semibold transition-all duration-150 ease-out active:scale-[0.98] cursor-pointer ${
                            isEditing ? "bg-accent-fill text-accent" : "bg-fill-secondary text-label"
                        }`}
                    >
                        {isEditing ? "Editing…" : "Edit Default"}
                    </button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
                    <div className="relative flex-1">
                        <IoSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-label-secondary text-lg pointer-events-none" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search"
                            className="w-full h-11 pl-10 pr-10 rounded-xl bg-fill-secondary text-label text-[15px] outline-none placeholder:text-label-secondary focus:ring-2 focus:ring-accent"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch("")}
                                aria-label="Clear search"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-label-secondary hover:text-label cursor-pointer"
                            >
                                <IoCloseCircle className="text-lg" />
                            </button>
                        )}
                    </div>
                    <div className="inline-flex items-center gap-1 p-1 rounded-full bg-fill-secondary self-center sm:self-auto">
                        {segment("name", "Name")}
                        {segment("status", "Status")}
                    </div>
                </div>

                {isLoading ? (
                    <div className="rounded-2xl bg-surface shadow-sm px-4 py-5 text-center text-[12px] font-bold tracking-widest text-label-secondary animate-pulse">
                        FETCHING PEOPLE FROM MRT
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {filteredPeople.map(person => (
                            <Person
                                key={person.id}
                                person={person}
                                handleStatusChange={handleStatusChange}
                                handleNameChange={handleNameChange}
                                deletePerson={deletePerson}
                                isEditing={isEditing}
                            />
                        ))}
                        {filteredPeople.length === 0 && search.trim() !== "" && (
                            <div className="md:col-span-2 text-center text-label-secondary text-[15px] py-8">
                                No one matches “{search.trim()}”
                            </div>
                        )}
                        <button
                            onClick={addPerson}
                            className="md:col-span-2 flex items-center justify-center gap-2 w-full min-h-[52px] rounded-xl border border-separator bg-surface text-accent text-[16px] font-medium hover:bg-fill-secondary transition-colors cursor-pointer"
                        >
                            <IoPersonAddSharp className="text-xl" />
                            Add person
                        </button>
                    </div>
                )}

                {isEditing ? (
                    <button
                        onClick={updateDefault}
                        disabled={!tempModified}
                        className={`${primaryBtn} ${
                            tempModified ? "bg-accent text-on-accent hover:bg-accent-hover" : "bg-fill-secondary text-label-secondary"
                        }`}
                    >
                        {isSaving ? <AiOutlineLoading3Quarters className="animate-spin text-2xl" /> : "Update Default"}
                    </button>
                ) : (
                    <div className="flex flex-col gap-2.5">
                        <button
                            onClick={saveCurrent}
                            disabled={!currModified}
                            className={`${primaryBtn} ${
                                currModified ? "bg-accent text-on-accent hover:bg-accent-hover" : "bg-fill-secondary text-label-secondary"
                            }`}
                        >
                            {isSaving ? <AiOutlineLoading3Quarters className="animate-spin text-2xl" /> : "Save"}
                        </button>
                        <button
                            onClick={() => copyGenerate(currentPpl)}
                            className={`${primaryBtn} bg-accent-fill text-accent`}
                        >
                            Generate Message
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
};

export default Attendance;
