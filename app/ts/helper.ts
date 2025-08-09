import { PersonData } from "../types";

type UnicodeStyle = "bold" | "italic" | "bold italic" | "plain";

type ConversionSpec = {
	r: string;
	d: number;
};

interface Converter {
	c: (text: string, spec: ConversionSpec[]) => string;
	plain: (text: string) => string;
	bold: (text: string) => string;
	italic: (text: string) => string;
	bolditalic: (text: string) => string;
	[key: string]: Function;
}

function unicodeFormat(text: string, style: UnicodeStyle): string;
function unicodeFormat(text: any[], style: UnicodeStyle): any[];

/**
 * Converts text to bold, italic, or plain Unicode characters.
 *
 * @param text The text string or array of strings to format.
 * @param style One of "bold", "italic", "bold italic" or "plain".
 * @returns The formatted text, matching the input type (string or array).
 */
function unicodeFormat(text: any, style: UnicodeStyle): any {
	const conv: Converter = {
		c: (text: string, spec: ConversionSpec[]): string =>
			text.replace(new RegExp(`[${spec.reduce((s, { r }) => (s += r), "")}]`, "g"), e => {
				const t = e.codePointAt(0);
				if (!t || !((48 <= t && t <= 57) || (65 <= t && t <= 90) || (97 <= t && t <= 122))) {
					return e;
				}
				return spec.reduce((s, { r, d }) => (e.match(new RegExp(`[${r}]`)) ? String.fromCodePoint(t + d) : s), "");
			}),
		plain: function (text: string): string {
			return text.normalize("NFKC");
		},
		bold: function (text: string): string {
			return this.c(text, [
				{ r: "0-9", d: 120734 },
				{ r: "A-Z", d: 120211 },
				{ r: "a-z", d: 120205 },
			]);
		},
		italic: function (text: string): string {
			return this.c(text, [
				{ r: "A-Z", d: 120263 },
				{ r: "a-z", d: 120257 },
			]);
		},
		bolditalic: function (text: string): string {
			return this.c(text, [
				{ r: "0-9", d: 120734 },
				{ r: "A-Z", d: 120315 },
				{ r: "a-z", d: 120309 },
			]);
		},
	};

	const s = style
		.toLowerCase()
		.split(" ")
		.sort()
		.join("")
		.replace(/[^a-z]/g, "");

	if (!conv[s]) {
		throw new Error(`unicodeFormat expected a style of "bold", "italic", "bold italic" or "plain", but got "${style}" instead.`);
	}

	const _format = (inputText: any): any => {
		if (Array.isArray(inputText)) {
			return inputText.map(_format);
		}
		if (inputText || inputText === 0) {
			return conv[s](conv.plain(String(inputText)));
		}
		return null;
	};

	return _format(text);
}

const generateId = () => {
	return Date.now().toString();
};

const copyGenerate = (currentPpl?: PersonData[]): void => {
	if (!currentPpl) return;

	const headerText = unicodeFormat("Attendance", "bold");
	let message = headerText + "\n\n";

	// Sitting Service 2
	const sittingS2 = currentPpl.filter(p => p.status.includes("S2: Sitting") && p.name).map(p => p.name);
	if (sittingS2.length > 0) message += `S2: (${sittingS2.length})\n- ${sittingS2.join(", ")}\n\n`;

	// Serving
	const serving = currentPpl.filter(p => p.status === "Serving" && p.name).map(p => p.name);
	const alwaysServing = currentPpl.filter(p => p.status === "Always Serving" && p.name).map(p => p.name);
	if (serving.length > 0 || alwaysServing.length > 0) {
		const allServing = [...serving, ...alwaysServing];
		message += `Serving: (${allServing.length})\n- ${allServing.join(", ")}\n\n`;
	}

	// TBC
	const tbc = currentPpl.filter(p => p.status === "TBC" && p.name).map(p => p.name);
	if (tbc.length > 0) message += `TBC: (${tbc.length})\n- ${tbc.join(", ")}\n\n`;

	// Others
	const others = currentPpl.filter(p => p.status === "Others" && p.name).map(p => p.name);
	if (others.length > 0) message += `OTH: (${others.length})\n- ${others.join(", ")}\n\n`;

	// Sitting Service 1/3
	const sittingS13 = currentPpl.filter(p => p.status.includes("S1: Sitting") || (p.status.includes("S3: Sitting") && p.name)).map(p => p.name);
	if (sittingS13.length > 0) message += `S1/S3: (${sittingS13.length})\n- ${sittingS13.join(", ")}\n\n`;

	// Copy message
	navigator.clipboard.writeText(message.trim()).then(
		() => alert("Message copied to clipboard!"),
		err => console.error("Failed to copy message: ", err)
	);
};

export { unicodeFormat, generateId, copyGenerate };
