import { PersonData } from "../types";
import { siteURL } from "./vars";

export async function getCurrentPpl(): Promise<PersonData[]> {
	try {
		const response = await fetch(`${siteURL}/api/current`);
		if (!response.ok) {
			throw new Error(`Network response was not ok: ${response.statusText}`);
		}
		const data: PersonData[] = await response.json();
		return data;
	} catch (error) {
		console.error("Failed to fetch current people:", error);
		return [];
	}
}

export async function saveCurrentPpl(people: PersonData[]): Promise<void> {
	try {
		await fetch(`${siteURL}/api/current`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(people),
		});
	} catch (error) {
		console.error("Failed to save current people:", error);
	}
}
