"use client";

import React, { useEffect, useState } from "react";
import { unicodeFormat } from "./ts/helper";
import { getCurrentPpl } from "./ts/app";

import Person from "./components/Person";
import { PersonData } from "./types";

const generateUUID = () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
        /[xy]/g,
        function (c) {
            const r = (Math.random() * 16) | 0;
            const v = c === "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        }
    );
};

// Implement store to get and update current and default people

const Home: React.FC = () => {
    const [currentPpl, setCurrentPpl] = useState<PersonData[] | undefined>([
        {
            id: generateUUID(),
            name: "John Doe",
            status: "Serving",
        },
        {
            id: generateUUID(),
            name: "Jane Smith",
            status: "Always Serving",
        },
    ]);
    const [defaultPpl, setDefaultPpl] = useState<PersonData[] | undefined>([
        {
            id: generateUUID(),
            name: "Michael Johnson",
            status: "Sitting",
        },
        {
            id: generateUUID(),
            name: "Emily Davis",
            status: "Others",
        },
    ]);
    const [isEditing, setIsEditing] = useState<boolean>(false);

    const updateDefault = (): void => {
        console.log("Implement save to store");
        setIsEditing(false);
        console.log("Updated default", defaultPpl);
    };

    const handleStatusChange = (
        id: string,
        newStatus: string,
        isEditing: boolean
    ): void => {
        if (isEditing) {
            setDefaultPpl((prev) =>
                prev?.map((person) =>
                    person.id == id ? { ...person, status: newStatus } : person
                )
            );
        } else {
            setCurrentPpl((prev) =>
                prev?.map((person) =>
                    person.id == id ? { ...person, status: newStatus } : person
                )
            );
        }
    };

    const handleNameChange = (
        id: string,
        newName: string,
        isEditing: boolean
    ): void => {
        if (isEditing) {
            setDefaultPpl((prev) =>
                prev?.map((person) =>
                    person.id == id ? { ...person, name: newName } : person
                )
            );
        } else {
            setCurrentPpl((prev) =>
                prev?.map((person) =>
                    person.id == id ? { ...person, name: newName } : person
                )
            );
        }
    };

    const copyGenerate = (): void => {
        if (!currentPpl) return;

        const sitting = currentPpl
            .filter((p) => p.status === "Sitting")
            .map((p) => p.name);
        const serving = currentPpl
            .filter((p) => p.status === "Serving")
            .map((p) => p.name);
        const alwaysServing = currentPpl
            .filter((p) => p.status === "Always Serving")
            .map((p) => p.name);
        const others = currentPpl
            .filter((p) => p.status === "Others")
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

    return (
        <main>
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 space-y-6">
                    <header>
                        <p className="text-4xl font-bold text-slate-800 text-center">
                            Attendance Generator
                        </p>
                        <p className="text-center text-slate-500 mt-1">
                            Update the status for each person
                        </p>
                    </header>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPpl(defaultPpl)}
                            className="w-full bg-red-800 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg"
                        >
                            Reset
                        </button>
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className={`w-full bg-slate-800 hover:bg-slate-700 font-bold py-2 px-4 rounded-lg 
								${isEditing ? "text-blue-400" : "text-white"} `}
                        >
                            {isEditing ? "Editing" : "Edit Default"}
                        </button>
                    </div>

                    <div className="space-y-3">
                        {isEditing
                            ? defaultPpl &&
                              defaultPpl.map((person) => (
                                  <Person
                                      key={person.id}
                                      person={person}
                                      handleStatusChange={handleStatusChange}
                                      handleNameChange={handleNameChange}
                                      isEditing={isEditing}
                                  />
                              ))
                            : currentPpl &&
                              currentPpl.map((person) => (
                                  <Person
                                      key={person.id}
                                      person={person}
                                      handleStatusChange={handleStatusChange}
                                      handleNameChange={handleNameChange}
                                      isEditing={isEditing}
                                  />
                              ))}
                    </div>

                    {isEditing ? (
                        <button
                            onClick={updateDefault}
                            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 active:scale-95 transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Update Default
                        </button>
                    ) : (
                        <button
                            onClick={copyGenerate}
                            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 active:scale-95 transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
