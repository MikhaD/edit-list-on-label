import { HeadingType } from "../src/types";
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

test("Match hash heading regex", () => {
	expect("").not.toMatch(Section.HASH_HEADING);
	expect("#heading").not.toMatch(Section.HASH_HEADING);
	expect("head# ing").not.toMatch(Section.HASH_HEADING);
	expect(" heading").not.toMatch(Section.HASH_HEADING);
	expect(" # heading").toMatch(Section.HASH_HEADING);
	expect("## heading").toMatch(Section.HASH_HEADING);
	expect("  ### heading").toMatch(Section.HASH_HEADING);
	expect("####  heading").toMatch(Section.HASH_HEADING);
	expect(" ##### heading").toMatch(Section.HASH_HEADING);
	expect("######  heading").toMatch(Section.HASH_HEADING);
	expect("####### heading").not.toMatch(Section.HASH_HEADING);
});

test("Match dash line regex", () => {
	expect("").not.toMatch(Section.DASH_LINE);
	expect("hello").not.toMatch(Section.DASH_LINE);
	expect("---a-").not.toMatch(Section.DASH_LINE);
	expect("- ---").not.toMatch(Section.DASH_LINE);
	expect("--").not.toMatch(Section.DASH_LINE);
	expect("---").toMatch(Section.DASH_LINE);
	expect(" ---").toMatch(Section.DASH_LINE);
	expect("--- ").toMatch(Section.DASH_LINE);
	expect("-------- ").toMatch(Section.DASH_LINE);
	expect("  --------  ").toMatch(Section.DASH_LINE);
});

test("Match equals line regex", () => {
	expect("").not.toMatch(Section.EQUALS_LINE);
	expect("hello").not.toMatch(Section.EQUALS_LINE);
	expect("===a=").not.toMatch(Section.EQUALS_LINE);
	expect("= ===").not.toMatch(Section.EQUALS_LINE);
	expect("==").not.toMatch(Section.EQUALS_LINE);
	expect("===").toMatch(Section.EQUALS_LINE);
	expect(" ===").toMatch(Section.EQUALS_LINE);
	expect("=== ").toMatch(Section.EQUALS_LINE);
	expect("======== ").toMatch(Section.EQUALS_LINE);
	expect("  ========  ").toMatch(Section.EQUALS_LINE);
});

describe("Constructor", () => {
	test("Zero lines", () => {
		expect(() => { new Section([], HeadingType.none); }).toThrowError("Cannot create an empty, headingless section");
		expect(() => { new Section([], HeadingType.underline); }).toThrowError("Cannot create an empty, headingless section");
		expect(() => { new Section([], HeadingType.hash); }).toThrowError("Cannot create an empty, headingless section");
	});
	test("One line", () => {
		expect(() => { new Section(["# Heading!"], HeadingType.underline); }).toThrowError("Cannot have underline heading with only one line");
		expect(() => { new Section(["# Heading!"], HeadingType.none); }).toThrowError("Incorrect heading type");
		expect((new Section(["# Heading!"], HeadingType.hash)).heading.value).toBe("Heading!");
		expect((new Section(["Heading!"], HeadingType.none)).heading.value).toBe("");
		expect(() => { new Section(["Heading!"], HeadingType.hash); }).toThrowError("Invalid heading");
		expect(() => { new Section(["####### Heading!"], HeadingType.hash); }).toThrowError("Invalid heading");
	});
	test("Underline heading", () => {
		expect(() => { new Section(["---", "==="], HeadingType.underline); }).toThrowError("Invalid heading");
		expect(() => { new Section(["# Heading!", "---"], HeadingType.underline); }).toThrowError("Incorrect heading type");
		expect(() => { new Section(["#Heading!", "---=-"], HeadingType.underline); }).toThrowError("Underline heading has missing or invalid underline");
		expect((new Section(["#Heading!", "==="], HeadingType.underline)).heading.level).toBe(1);
		expect((new Section(["#Heading!", "---"], HeadingType.underline)).heading.level).toBe(2);
	});
});

test("Immutable lines", () => {
	const lines = ["# Heading", "text"];
	const section = new Section(lines, HeadingType.hash);
	lines.push("new line");
	expect(section.toString()).toBe("# Heading\ntext");
});

describe("addToList method", () => {
	test("No lists", () => {
		const lines = [
			"# Heading",
			"Some random",
			"filler text"
		];
		const section = new Section(lines, HeadingType.hash);
		section.addToList("I am a new list item");
		lines.push("- I am a new list item");
		expect(section.toString()).toBe(lines.join("\n"));
	});
	test("One list in middle of file", () => {
		const lines = [
			"# Heading",
			"Some random",
			" * list item",
			"filler text"
		];
		const section = new Section(lines, HeadingType.hash);
		section.addToList("I am a new list item");
		expect(section.toString()).toBe([
			"# Heading",
			"Some random",
			" * list item",
			"- I am a new list item",
			"filler text"
		].join("\n"));
	});
	test("Multiple lists", () => {
		const lines = [
			"# Heading",
			"Some random",
			" * list item",
			"filler text",
			"+  another list"
		];
		const section = new Section(lines, HeadingType.hash);
		section.addToList("I am a new list item");
		lines.push("- I am a new list item");
		expect(section.toString()).toBe(lines.join("\n"));
	});
});

describe("removeFromList method", () => {
	const lines = [
		"Heading",
		"===",
		"Some random",
		" * list item",
		"+  another",
		"-  yet another",
		"filler text",
		"another",
		"+  another list"
	];
	test("Not in list", () => {
		const section = new Section(lines, HeadingType.underline);
		expect(section.removeFromList("item")).toBe(1);
		expect(section.removeFromList("+  another")).toBe(1);
		expect(section.toString()).toBe(lines.join("\n"));
	});
	test("In list", () => {
		const section = new Section(lines, HeadingType.underline);
		expect(section.removeFromList("another")).toBe(0);
		expect(section.toString()).toBe([
			"Heading",
			"===",
			"Some random",
			" * list item",
			"-  yet another",
			"filler text",
			"another",
			"+  another list"
		].join("\n"));
	});
});

describe("editListItem method", () => {
	const lines = [
		"---",
		"===",
		"Some random",
		" * list item",
		"+  another",
		"-  yet another",
		"filler text",
		"another",
		"+  another list"
	];
	test("Not in list", () => {
		const section = new Section(lines, HeadingType.none);
		expect(section.editListItem("text", "new text")).toBe(1);
		expect(section.editListItem(" * list item", "new text")).toBe(1);
		expect(section.toString()).toBe(lines.join("\n"));
	});
	test("In list", () => {
		const section = new Section(lines, HeadingType.none);
		expect(section.editListItem("another", "one more")).toBe(0);
		expect(section.toString()).toBe([
			"---",
			"===",
			"Some random",
			" * list item",
			"- one more",
			"-  yet another",
			"filler text",
			"another",
			"+  another list"
		].join("\n"));
	});
});