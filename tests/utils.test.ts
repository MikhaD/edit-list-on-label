import { Label } from "@octokit/webhooks-definitions/schema";
import { execSync } from "child_process";
import { containsLabel, splitFiles, initializeGit, commitAndPush, EMAIL_REGEX } from "../src/utils";

jest.mock("child_process", () => ({
	execSync: jest.fn()
}));

const execSyncMock = execSync as jest.Mock;

beforeEach(() => {
	execSyncMock.mockClear();
});

describe("containsLabel", () => {
	test("Empty array", () => {
		const array: Label[] = [];
		expect(containsLabel(array, "enhancement")).toBe(false);
	});
	describe("Array of labels", () => {
		const array: Label[] = [
			{
				color: "d876e3",
				default: true,
				description: "Further information is requested",
				id: 3555053410,
				name: "question",
				node_id: "LA_kwDOGY2DE87T5c9i",
				url: "https://api.github.com/repos/MikhaD/action/labels/question"
			},
			{
				color: "311820",
				default: true,
				description: "Something isn't working",
				id: 3555053410,
				name: "bug",
				node_id: "LA_kwCATY2DE87T5c9i",
				url: "https://api.github.com/repos/MikhaD/action/labels/bug"
			},
			{
				color: "0B2337",
				default: true,
				description: "Improvements or additions to documentation",
				id: 3555053410,
				name: "documentation",
				node_id: "LA_kwPIGY2DE87T5c9i",
				url: "https://api.github.com/repos/MikhaD/action/labels/documentation"
			}
		];
		test("Array doesn't contain label", () => {
			expect(containsLabel(array, "enhancement")).toBe(false);
		});
		test("Array contains label", () => {
			expect(containsLabel(array, "bug")).toBe(true);
		});
	});
});

test("splitFiles", () => {
	expect(splitFiles("")).toEqual([""]);
	expect(splitFiles("./README.md    ")).toEqual(["./README.md    "]);
	expect(splitFiles("./README.md,    testfile")).toEqual(["./README.md", "testfile"]);
	expect(splitFiles("   ./README.md,    testfile  ")).toEqual(["   ./README.md", "testfile  "]);
});

test("EMAIL_REGEX", () => {
	expect("bOb@b0b.bob").toMatch(EMAIL_REGEX);
	expect("boB123_da+ma-n.3@B0b-43.B-0.b").toMatch(EMAIL_REGEX);
	expect("bob@bob.bob ").not.toMatch(EMAIL_REGEX);
	expect("bobbob.bob").not.toMatch(EMAIL_REGEX);
	expect("bob@bob").not.toMatch(EMAIL_REGEX);
	expect("bob@.bob").not.toMatch(EMAIL_REGEX);
	expect("bob@bob.").not.toMatch(EMAIL_REGEX);
	expect("@bob.bob").not.toMatch(EMAIL_REGEX);
	expect("bob@bob!.bob").not.toMatch(EMAIL_REGEX);
});

describe("initializeGit", () => {
	test("No parameters", () => {
		expect(initializeGit()).toBeUndefined();
		expect(execSyncMock).toBeCalledTimes(2);
		expect(execSyncMock).toBeCalledWith("git config --global user.email action@github.com");
		expect(execSyncMock).toBeCalledWith("git config --global user.name actions-user");
	});
	test("Valid parameters", () => {
		expect(initializeGit("bob@bob.bob", "bob")).toBeUndefined();
		expect(execSyncMock).toBeCalledTimes(2);
		expect(execSyncMock).toBeCalledWith("git config --global user.email bob@bob.bob");
		expect(execSyncMock).toBeCalledWith("git config --global user.name bob");
	});
	test("Invalid parameters", () => {
		expect(() => { initializeGit("bob@bob.b(o)b", "bob"); }).toThrow("Invalid email syntax");
		expect(execSyncMock).toBeCalledTimes(0);
	});
});

describe("commitAndPush", () => {
	test("One file", () => {
		expect(commitAndPush(["./README.md"], "changed shit")).toBeUndefined();
		expect(execSyncMock).toBeCalledTimes(3);
		expect(execSyncMock).toBeCalledWith("git add ./README.md");
		expect(execSyncMock).toBeCalledWith("git commit -m \"changed shit\"");
		expect(execSyncMock).toBeCalledWith("git push");
	});
	test("Multiple files", () => {
		expect(commitAndPush(["./README.md", " file.md"], "changed shit")).toBeUndefined();
		expect(execSyncMock).toBeCalledTimes(3);
		expect(execSyncMock).toBeCalledWith("git add ./README.md  file.md");
		expect(execSyncMock).toBeCalledWith("git commit -m \"changed shit\"");
		expect(execSyncMock).toBeCalledWith("git push");
	});
});
