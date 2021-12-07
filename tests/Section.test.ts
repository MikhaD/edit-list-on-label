import { Heading } from "../src/enums";
import Section from "../src/Section";

describe("Match list item regex", () => {

	test.each(["-", "*", "+"])("Match %s item", (symbol) => {
		expect(`    ${symbol} No Match`).not.toMatch(Section.LIST_ITEM);
		expect(`   ${symbol} Match`).toMatch(Section.LIST_ITEM);
		expect(`  ${symbol} Match`).toMatch(Section.LIST_ITEM);
		expect(` ${symbol} Match`).toMatch(Section.LIST_ITEM);
		expect(`${symbol} Match`).toMatch(Section.LIST_ITEM);
		expect(`${symbol}No Match`).not.toMatch(Section.LIST_ITEM);
		expect(` ${symbol}No Match`).not.toMatch(Section.LIST_ITEM);
		expect(`No${symbol} Match`).not.toMatch(Section.LIST_ITEM);
		expect(`No ${symbol}Match`).not.toMatch(Section.LIST_ITEM);
		expect(`No Match`).not.toMatch(Section.LIST_ITEM);
		expect(`No Match${symbol} `).not.toMatch(Section.LIST_ITEM);
		expect(`No Match ${symbol}`).not.toMatch(Section.LIST_ITEM);
	});
});

test("Basic constructor", () => {
	const section = new Section();
	expect(section.getHeading()).toBe("");
	expect(section.getHeading(false)).toBe("");
	expect(section.headingType).toBe(Heading.none);
	expect(section.lineCount()).toBe(0);
	expect(section.lastLine()).toBe("");
	expect(section.getText()).toEqual([]);
	expect(() => { section.popLastLine() }).toThrowError("No last line to pop");
});

test("Simple section", () => {
	const text = [
		"# Heading",
		"This is a section",
		"of text with a",
		"heading."
	];
	const section = new Section("# Heading", Heading.hash);
	for (const line of text) {
		section.addLine(line);
	}

	expect(section.getHeading()).toBe("Heading");
	expect(section.getHeading(false)).toBe("heading");
	expect(section.headingType).toBe(Heading.hash);
	expect(section.lineCount()).toBe(3);
	expect(section.lastLine()).toBe("heading.");
	expect(section.getText()).toEqual(text);
	expect(section.popLastLine()).toBe("heading.");
});

describe("Add to list", () => {
	test("No list", () => {
		const text = [
			"# Heading",
			"This is a section",
			"of text with a",
			"heading."
		];
		const section = new Section("# Heading", Heading.hash);
		for (const line of text) {
			section.addLine(line);
		}
		section.addToList("New Item!");
		expect(section.lastLine()).toBe("- New Item!");
	});
	test("List in body", () => {
		const text = [
			"# Heading",
			"This is a section",
			"of text with a",
			"heading.",
			"- New Item!",
			"last line"
		];
		const section = new Section("# Heading", Heading.hash);
		for (const line of text) {
			section.addLine(line);
		}
		section.addToList("Should go in body");
		console.log(section);
		expect(section.getText()).toEqual([
			"# Heading",
			"This is a section",
			"of text with a",
			"heading.",
			"- New Item!",
			"- Should go in body",
			"last line"
		]);
	});
	test("Multiple lists in body", () => {
		const text = [
			"# Heading",
			"This is a section",
			"* first list",
			"of text with a",
			"heading.",
			"* Second list",
			"last line"
		];
		const section = new Section("# Heading", Heading.hash);
		for (const line of text) {
			section.addLine(line);
		}
		section.addToList("Should go in body");
		console.log(section);
		expect(section.getText()).toEqual([
			"# Heading",
			"This is a section",
			"* first list",
			"of text with a",
			"heading.",
			"* Second list",
			"- Should go in body",
			"last line"
		]);
	});
});

describe("Remove from list", () => {
	test("Not in section, no lists", () => {
		const text = [
			"# Heading",
			"This is a section",
			"of text with a",
			"heading."
		];
		const section = new Section("# Heading", Heading.hash);
		for (const line of text) {
			section.addLine(line);
		}
		expect(section.removeFromList("heading.")).toBe(1);
		expect(section.getText()).toEqual(text);
	});
	test("Not in section", () => {
		const text = [
			"# Heading",
			"This is a section",
			"of text with a",
			"heading.",
			"- list item"
		];
		const section = new Section("# Heading", Heading.hash);
		for (const line of text) {
			section.addLine(line);
		}
		expect(section.removeFromList("heading.")).toBe(1);
		expect(section.getText()).toEqual(text);
	});
	test("In last list", () => {
		const text = [
			"# Heading",
			"This is a section",
			"of text with a",
			"heading.",
			"- list item",
			"- second list item"
		];
		const section = new Section("# Heading", Heading.hash);
		for (const line of text) {
			section.addLine(line);
		}
		expect(section.removeFromList("list item")).toBe(0);
		expect(section.getText()).toEqual([
			"# Heading",
			"This is a section",
			"of text with a",
			"heading.",
			"- second list item"
		]);
	});
	test("In multiple lists", () => {
		const text = [
			"# Heading",
			"This is a section",
			"+ list item",
			"+ And another list item",
			"of text with a",
			"heading.",
			"+ list item",
			"+ second list item"
		];
		const section = new Section("# Heading", Heading.hash);
		for (const line of text) {
			section.addLine(line);
		}
		expect(section.removeFromList("list item")).toBe(0);
		expect(section.getText()).toEqual([
			"# Heading",
			"This is a section",
			"+ list item",
			"+ And another list item",
			"of text with a",
			"heading.",
			"+ second list item"
		]);
	});
});

