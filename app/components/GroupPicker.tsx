"use client";

import React, { useEffect, useState } from "react";
import { getGroups } from "../ts/server";
import { Group } from "../types";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

interface GroupPickerProps {
    onSelect: (group: Group) => void;
}

const GroupPicker: React.FC<GroupPickerProps> = ({ onSelect }) => {
    const [groups, setGroups] = useState<Group[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getGroups().then(g => {
            setGroups(g);
            setIsLoading(false);
        });
    }, []);

    return (
        <main>
            <div className="min-h-screen flex flex-col items-center justify-center px-4">
                <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 space-y-6">
                    <header className="text-center">
                        <p className="text-4xl font-bold text-slate-800">Attendance</p>
                        <p className="text-slate-500 mt-2">Choose a group to continue</p>
                    </header>

                    {isLoading ? (
                        <div className="flex justify-center py-8 text-slate-400">
                            <AiOutlineLoading3Quarters className="animate-spin text-3xl" />
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {groups.map(group => (
                                <button
                                    key={group.key}
                                    onClick={() => onSelect(group)}
                                    className="w-full py-4 px-6 rounded-xl border-2 border-slate-200 bg-slate-50 hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-800 text-slate-700 font-bold text-lg transition-all duration-150 ease-in-out cursor-pointer active:scale-95"
                                >
                                    {group.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};

export default GroupPicker;
