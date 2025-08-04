import React, { useEffect, useState } from "react";
import "./styles/App.css";
import { unicodeFormat } from "./ts/helper";
import { getCurrentPpl } from "./ts/app";

import Person from "./components/Person";
export interface PersonData {
	name: string;
	status: string;
}

// TODOs
// 1. Generate message should automatically copy and not display
// 2. Add reset button to write from default list to current list
// 3. Edit default button

const Home: React.FC = () => {
	// --- Typed State Hooks ---
	const [people, setPeople] = useState<PersonData[] | undefined>();
	const [defaultPpl, setDefaultPpl] = useState<PersonData[] | undefined>();
	const [isEditing, setIsEditing] = useState<boolean>(false);

	const updateDefault = (): void => {};

	const handleStatusChange = (name: string, newStatus: string): void => {
		setPeople(prevPeople => prevPeople?.map(person => (person.name === name ? { ...person, status: newStatus } : person)));
	};

	const copyGenerate = (): void => {
		if (!people) return;

		const sitting = people.filter(p => p.status === "Sitting").map(p => p.name);
		const serving = people.filter(p => p.status === "Serving").map(p => p.name);
		const alwaysServing = people.filter(p => p.status === "Always Serving").map(p => p.name);
		const others = people.filter(p => p.status === "Others").map(p => p.name);

		const headerText = unicodeFormat("Service 2 Attendance", "bold");
		let message = headerText + "\n\n";

		if (sitting.length > 0) {
			message += `Sitting: (${sitting.length})\n- ${sitting.join(", ")}\n\n`;
		}
		if (serving.length > 0 || alwaysServing.length > 0) {
			const allServing = [...serving, ...alwaysServing];
			message += `Serving: (${allServing.length})\n- ${allServing.join(", ")}\n\n`;
		}
		if (others.length > 0) {
			message += `Others: (${others.length})\n- ${others.join(", ")}\n\n`;
		}

		navigator.clipboard.writeText(message.trim()).then(
			() => alert("Message copied to clipboard!"),
			err => console.error("Failed to copy message: ", err)
		);
	};

	return (
		<main className="">
			<div className="min-h-screen flex items-center justify-center p-4">
				<div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 space-y-6">
					<header>
						<p className="text-4xl font-bold text-slate-800 text-center">Attendance Generator</p>
						<p className="text-center text-slate-500 mt-1">Update the status for each person</p>
					</header>

					<div className="flex gap-2">
						<button className="w-full bg-red-800 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg">Reset</button>
						<button className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-lg">Edit Default</button>
					</div>

					<div className="space-y-3">
						{people &&
							people.map(person => (
								<Person
									key={person.name}
									name={person.name}
									status={person.status}
									onStatusChange={handleStatusChange}
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
