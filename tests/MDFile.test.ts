import { HeadingType } from "../src/types";
import { isDashLine, isEqualsLine, isHashHeading, sectionMarkdown } from "../src/parseMarkdown";
import Section from "../src/Section";

test("Match hash heading", () => {
	expect(isHashHeading("")).toBe(false);
	expect(isHashHeading("#heading")).toBe(false);
	expect(isHashHeading("head# ing")).toBe(false);
	expect(isHashHeading(" heading")).toBe(false);
	expect(isHashHeading("# heading")).toBe(true);
	expect(isHashHeading("## heading")).toBe(true);
	expect(isHashHeading("### heading")).toBe(true);
	expect(isHashHeading("#### heading")).toBe(true);
	expect(isHashHeading("##### heading")).toBe(true);
	expect(isHashHeading("###### heading")).toBe(true);
	expect(isHashHeading("####### heading")).toBe(false);
});

test("Match dash line", () => {
	expect(isDashLine("")).toBe(false);
	expect(isDashLine("hello")).toBe(false);
	expect(isDashLine("---a-")).toBe(false);
	expect(isDashLine("- ---")).toBe(false);
	expect(isDashLine("--")).toBe(false);
	expect(isDashLine("---")).toBe(true);
	expect(isDashLine(" ---")).toBe(true);
	expect(isDashLine("--- ")).toBe(true);
	expect(isDashLine("-------- ")).toBe(true);
	expect(isDashLine("  --------  ")).toBe(true);
});

test("Match equals line", () => {
	expect(isEqualsLine("")).toBe(false);
	expect(isEqualsLine("hello")).toBe(false);
	expect(isEqualsLine("===a=")).toBe(false);
	expect(isEqualsLine("= ===")).toBe(false);
	expect(isEqualsLine("==")).toBe(false);
	expect(isEqualsLine("===")).toBe(true);
	expect(isEqualsLine(" ===")).toBe(true);
	expect(isEqualsLine("=== ")).toBe(true);
	expect(isEqualsLine("======== ")).toBe(true);
	expect(isEqualsLine("  ========  ")).toBe(true);
});

test("No lines", () => {
	expect(sectionMarkdown([])).toEqual(new Map<string, Section>());
});

describe("No headings", () => {
	const text = [
		"this is a section",
		"of text without any",
		"headings"
	];
	const data: [boolean, string[]][] = [[true, text], [false, text]];
	test.each(data)("caseSensitive %s", (caseSensitive, text) => {
		const output = sectionMarkdown(text, caseSensitive);
		expect(output.size).toBe(1);
		expect(output.get("")).toBeDefined();
		expect(output.get("")?.lineCount()).toBe(3);
		expect(output.get("")?.headingType).toBe(HeadingType.none);
	});
});

describe("Hash heading first line", () => {
	const text = [
		"## Hash Heading",
		"this is a section",
		"of text with some",
		"headings"
	];
	const data: [boolean, string[]][] = [[true, text], [false, text]];
	test.each(data)("caseSensitive %s", (caseSensitive, text) => {
		const output = sectionMarkdown(text, caseSensitive);
		const heading = caseSensitive ? "Hash Heading" : "hash heading";
		expect(output.size).toBe(1);
		expect(output.get(heading)).toBeDefined();
		expect(output.get(heading)?.lineCount()).toBe(3);
		expect(output.get(heading)?.headingType).toBe(HeadingType.hash);
	});
});

describe("Hash heading not first line", () => {
	const text = [
		"first line",
		"## Hash Heading",
		"this is a section",
		"of text with some",
		"headings"
	];
	const data: [boolean, string[]][] = [[true, text], [false, text]];
	test.each(data)("caseSensitive %s", (caseSensitive, text) => {
		const output = sectionMarkdown(text, caseSensitive);
		const heading = caseSensitive ? "Hash Heading" : "hash heading";
		expect(output.size).toBe(2);

		expect(output.get("")).toBeDefined();
		expect(output.get("")?.lineCount()).toBe(1);
		expect(output.get("")?.headingType).toBe(HeadingType.none);

		expect(output.get(heading)).toBeDefined();
		expect(output.get(heading)?.lineCount()).toBe(3);
		expect(output.get(heading)?.headingType).toBe(HeadingType.hash);
	});
});

describe("Heading same as another", () => {
	const text = [
		"first line",
		"Heading",
		"----",
		"some line content",
		"## heading",
		"this is a section",
		"of text with some",
		"headings"
	];
	test("caseSensitive true", () => {
		const output = sectionMarkdown(text, true);
		expect(output.size).toBe(3);
		expect(output.get("Heading")).toBeDefined();
		expect(output.get("Heading")?.lineCount()).toBe(1);
		expect(output.get("Heading")?.headingType).toBe(HeadingType.underline);

		expect(output.get("heading")).toBeDefined();
		expect(output.get("heading")?.lineCount()).toBe(3);
		expect(output.get("heading")?.headingType).toBe(HeadingType.hash);
	});

	test("caseSensitive false", () => {
		const output = sectionMarkdown(text);
		expect(output.size).toBe(2);
		expect("heading").toBeDefined();
		expect(output.get("heading")?.lineCount()).toBe(1);
		expect(output.get("heading")?.headingType).toBe(HeadingType.underline);

		expect(output.get("Heading")).toBeUndefined();
	});
});

for (const underline of ["----", "===="]) {
	describe(`${underline} underline heading first two lines`, () => {
		const text = [
			"Underline Heading",
			underline,
			"this is a section",
			"of text with some",
			"headings"
		];
		const data: [boolean, string[]][] = [[true, text], [false, text]];
		test.each(data)("caseSensitive %s", (caseSensitive, text) => {
			const output = sectionMarkdown(text, caseSensitive);
			const heading = caseSensitive ? "Underline Heading" : "underline heading";
			expect(output.size).toBe(1);
			expect(output.get(heading)).toBeDefined();
			expect(output.get(heading)?.lineCount()).toBe(3);
			expect(output.get(heading)?.headingType).toBe(HeadingType.underline);
		});
	});
}

describe("Multiple headings test", () => {
	const data: [string, string, number][] = [
		["Heading", "heading", 1],
		["---", "", 3],
		["===", "===", 1]
	];

	test.each(data)("First line is %s", (firstLine, heading, lines) => {
		const text = [
			firstLine,
			"---",
			"this is an example",
			"### Of two",
			"Headings of",
			"===",
			"different types",
			"without any",
			"data in between",
			"---"
		];
		const output = sectionMarkdown(text);

		expect(output.get(heading)).toBeDefined();
		expect(output.get(heading)?.lineCount()).toBe(lines);

		expect(output.get("of two")?.lineCount()).toBe(0);
		expect(output.get("headings of")?.lineCount()).toBe(2);
		expect(output.get("data in between")?.lineCount()).toBe(0);
	});
});