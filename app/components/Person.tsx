import React from "react";
import { STATUSENUM } from "../ts/enums";

interface PersonProps {
	name: string;
	status: string;
	onStatusChange: (name: string, newStatus: string) => void;
}

const Person: React.FC<PersonProps> = ({ name, status, onStatusChange }) => {
	const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		onStatusChange(name, e.target.value);
	};

	return (
		<div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
			<p className="text-lg font-medium text-slate-700">{name}</p>

			<select
				id={name}
				value={status}
				onChange={handleChange}
				className="w-40 p-2 border border-slate-300 rounded-md shadow-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
			>
				{STATUSENUM.map(stat => (
					<option
						key={stat}
						value={stat}
						className="pr-2"
					>
						{stat}
					</option>
				))}
			</select>
		</div>
	);
};

export default Person;
