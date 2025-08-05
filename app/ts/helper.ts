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
            text.replace(
                new RegExp(`[${spec.reduce((s, { r }) => (s += r), "")}]`, "g"),
                (e) => {
                    const t = e.codePointAt(0);
                    if (
                        !t ||
                        !(
                            (48 <= t && t <= 57) ||
                            (65 <= t && t <= 90) ||
                            (97 <= t && t <= 122)
                        )
                    ) {
                        return e;
                    }
                    return spec.reduce(
                        (s, { r, d }) =>
                            e.match(new RegExp(`[${r}]`))
                                ? String.fromCodePoint(t + d)
                                : s,
                        ""
                    );
                }
            ),
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
        throw new Error(
            `unicodeFormat expected a style of "bold", "italic", "bold italic" or "plain", but got "${style}" instead.`
        );
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

const generateId = () => Math.random().toString(36).substring(2, 9);

export { unicodeFormat, generateId };
