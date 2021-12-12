import MDFile from "../src/MDFile";
import { readFileSync } from "fs";

jest.mock("fs", () => ({
	readFileSync: jest.fn()
}));
const mockRFS = readFileSync as jest.Mock;
mockRFS.mockReturnValue(Buffer.from([
	"---",
	"===",
	"Heading",
	"---",
	"random text",
	"filler text",
	"# heading",
	"+ a list",
	"not another heading"
].join("\n")));

test("Non markdown file", () => {
	expect(() => { new MDFile("./README"); }).toThrowError("./README is not a markdown file");
});

test("No headings", () => {
	mockRFS.mockReturnValueOnce(Buffer.from([
		"Heading",
		"=-=",
		"Some random",
		" * list item",
		"+  another",
		"-  yet another",
		"filler text",
		"another",
		"+  another list"
	].join("\n")));
	const file = new MDFile(".mArKdOwN");

	expect(file.totalSections()).toBe(1);
	expect(file.totalUniqueSections()).toBe(1);
});

describe("section method", () => {
	test.each([[true, 3, 3], [false, 3, 2]])("Case sensitive %s", (caseSensitive, sects, uniqueSects) => {
		const file = new MDFile(".mArKdOwN", caseSensitive);
		expect(file.totalSections()).toBe(sects);
		expect(file.totalUniqueSections()).toBe(uniqueSects);
	});
	test("Sections with same heading", () => {
		mockRFS.mockReturnValueOnce(Buffer.from([
			"Heading",
			"===",
			"Some random",
			" * list item",
			"+  another",
			"-  yet another",
			"filler text",
			"Heading",
			"-----",
			"+  another list"
		].join("\n")));
		const file = new MDFile(".mArKdOwN");
		expect(file.totalSections()).toBe(2);
		expect(file.totalUniqueSections()).toBe(1);

		file.addToList("Heading", "listicus itemus");
		expect(file.toString()).toBe([
			"Heading",
			"===",
			"Some random",
			" * list item",
			"+  another",
			"-  yet another",
			"- listicus itemus",
			"filler text",
			"Heading",
			"-----",
			"+  another list"
		].join("\n"));
	});
});

describe("add to list method", () => {
	const str1 = [
		"---",
		"===",
		"Heading",
		"---",
		"random text",
		"filler text",
		"- da new list item",
		"# heading",
		"+ a list",
		"not another heading"
	];
	const str2 = [
		"---",
		"===",
		"Heading",
		"---",
		"random text",
		"filler text",
		"# heading",
		"+ a list",
		"- da new list item",
		"not another heading"
	];
	test.each([[true, str1], [false, str2]])("Case sensitive %s", (caseSensitive, str) => {
		const file = new MDFile(".mArKdOwN", caseSensitive);
		file.addToList("Heading", "da new list item");
		expect(file.toString()).toBe(str.join("\n"));
	});
	test("Section not present", () => {
		const file = new MDFile(".mArKdOwN");
		file.addToList("---", "da new list item");
		expect(file.toString()).toBe([
			"---",
			"===",
			"Heading",
			"---",
			"random text",
			"filler text",
			"# heading",
			"+ a list",
			"not another heading",
			"# ---",
			"- da new list item"
		].join("\n"));
	});
});

describe("remove from list method", () => {
	const str1 = [
		"---",
		"===",
		"Heading",
		"---",
		"random text",
		"filler text",
		"# heading",
		"+ a list",
		"not another heading"
	];
	const str2 = [
		"---",
		"===",
		"Heading",
		"---",
		"random text",
		"filler text",
		"# heading",
		"not another heading"
	];
	test.each([[true, 1, str1], [false, 0, str2]])("Case sensitive %s", (caseSensitive, res, str) => {
		const file = new MDFile(".mArKdOwN", caseSensitive);
		expect(file.removeFromList("not present", "a list")).toBe(1);
		expect(file.removeFromList("Heading", "blonk")).toBe(1);
		expect(file.removeFromList("Heading", "a list")).toBe(res);
		expect(file.toString()).toBe(str.join("\n"));
	});
});

describe("edit list item method", () => {
	const str1 = [
		"---",
		"===",
		"Heading",
		"---",
		"random text",
		"filler text",
		"# heading",
		"+ a list",
		"not another heading"
	];
	const str2 = [
		"---",
		"===",
		"Heading",
		"---",
		"random text",
		"filler text",
		"# heading",
		"- the list",
		"not another heading"
	];
	test.each([[true, 1, str1], [false, 0, str2]])("Case sensitive %s", (caseSensitive, res, str) => {
		const file = new MDFile(".mArKdOwN", caseSensitive);
		expect(file.editListItem("not present", "a list", "b list")).toBe(1);
		expect(file.editListItem("Heading", "blonk", "plonk")).toBe(1);
		expect(file.editListItem("Heading", "a list", "the list")).toBe(res);
		expect(file.toString()).toBe(str.join("\n"));
	});
});