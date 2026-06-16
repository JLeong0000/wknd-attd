"use client";

import React, { useEffect, useState } from "react";
import { getGroups } from "../ts/server";
import { Group } from "../types";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { IoChevronForward } from "react-icons/io5";

interface GroupPickerProps {
    onSelect: (group: Group) => void;
}

const GroupPicker: React.FC<GroupPickerProps> = ({ onSelect }) => {
    const [groups, setGroups] = useState<Group[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getGroups()
            .then(g => {
                setGroups(g);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Failed to load groups", err);
                setIsLoading(false);
            });
    }, []);

    return (
        <main className="min-h-screen flex flex-col items-center justify-center px-5 bg-app">
            <div className="w-full max-w-md space-y-8">
                <header className="px-1">
                    <h1 className="font-heading text-[40px] leading-none font-extrabold tracking-tight text-label">Attendance</h1>
                    <p className="text-label-secondary mt-2 text-lg">Choose a group to continue</p>
                </header>

                {isLoading ? (
                    <div className="flex justify-center py-10 text-label-secondary">
                        <AiOutlineLoading3Quarters className="animate-spin text-2xl" />
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl bg-surface shadow-sm">
                        {groups.map((group, i) => (
                            <button
                                key={group.key}
                                onClick={() => onSelect(group)}
                                className={`flex w-full items-center justify-between gap-3 px-5 py-4 text-left cursor-pointer transition-colors hover:bg-fill-secondary active:bg-fill-secondary-hover ${
                                    i > 0 ? "border-t border-separator" : ""
                                }`}
                            >
                                <span className="text-lg font-medium text-label">{group.label}</span>
                                <IoChevronForward className="text-label-secondary text-lg shrink-0" />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
};

export default GroupPicker;
