import { getInput, setFailed, info } from "@actions/core";
import { context } from "@actions/github";
import { IssuesEvent } from "@octokit/webhooks-definitions/schema";
import { writeFileSync } from "fs";
import main from "../src/main";
import MDFile from "../src/MDFile";
import { commitAndPush, containsLabel, initializeGit, splitFiles } from "../src/utils";

jest.mock("@actions/core", () => ({
	getInput: jest.fn((input: string) => {
		switch (input) {
			case "case-sensitive":
				return "true";
			case "heading":
				return "Upcoming Features";
			case "label":
				return "enhancement";
			default:
				return "";
		}
	}),
	setFailed: jest.fn(),
	info: jest.fn()
}));
/** Mock of `getInput()` */
const mockGI = getInput as jest.Mock;

jest.mock("@actions/github", () => ({
	context: {
		eventName: "issues",
		payload: {
			action: "labeled",
			issue: {
				number: 42,
				title: "Issue title",
				labels: [
					{ name: "bug" },
					{ name: "enhancement" },
					{ name: "question" }
				]
			},
			label: {
				// Only here for "labeled" & "unlabeled" 
				name: "enhancement"
			}
		} as IssuesEvent
	}
}));
const mockContext = JSON.parse(JSON.stringify(context));

jest.mock("../src/utils", () => ({
	containsLabel: jest.fn(() => false),
	splitFiles: jest.fn(() => ["./README.md"]),
	initializeGit: jest.fn(),
	commitAndPush: jest.fn()
}));
/** Mock of `splitFiles()` */
const mockSplitF = splitFiles as jest.Mock;

/** Mock of `MDFile.prototype.addToList()` */
const mockATL = jest.fn();
/** Mock of `MDFile.prototype.removeFromList()` */
const mockRFL = jest.fn(() => 0);
/** Mock of `MDFile.prototype.editListItem()` */
const mockELI = jest.fn(() => 0);
/** Mock of `MDFile.prototype.toString()` */
const mockTS = jest.fn(() => "");
jest.mock("../src/MDFile.ts", () => jest.fn(() => ({
	path: "./README.md",
	addToList: mockATL,
	removeFromList: mockRFL,
	editListItem: mockELI,
	toString: mockTS
})));
/** Mock of `MDFile` class */
const mockMDFile = MDFile as jest.MockedClass<typeof MDFile>;

jest.mock("fs", () => ({
	writeFileSync: jest.fn()
}));

beforeEach(() => {
	jest.clearAllMocks();
	(context as any) = JSON.parse(JSON.stringify(mockContext));
});

test("Wrong event", () => {
	(context as any).eventName = "incorrect";
	expect(main()).toBeUndefined();
	expect(setFailed).toBeCalledWith("Action should only be triggered on issues event");
});

test("Irrelevant label", () => {
	(context as any).payload.issue.labels = [];
	(context as any).payload.label.name = "";
	expect(main()).toBeUndefined();
	expect(getInput).toBeCalledTimes(4);
	expect(getInput).toBeCalledWith("case-sensitive");
	expect(getInput).toBeCalledWith("heading");
	expect(getInput).toBeCalledWith("label");
	expect(getInput).toBeCalledWith("files");
	expect(containsLabel).toBeCalledWith(context.payload.issue?.labels, "enhancement");
	expect(info).toBeCalledWith("Event not on labeled issue");
});

test.each([["faLSe"], ["0"]])("Case sensitive %s", (value) => {
	mockGI.mockImplementationOnce((input: string) => {
		switch (input) {
			case "case-sensitive":
				return value;
			case "heading":
				return "Upcoming Features";
			case "label":
				return "enhancement";
			default:
				return "";
		}
	});
	expect(main()).toBeUndefined();
	expect(commitAndPush).toBeCalledWith(["./README.md"], ":zap: updated upcoming features section in ./README.md");
});

test("Event type doesn't affect label", () => {
	(context as any).payload.action = "assigned";
	expect(main()).toBeUndefined();
	expect(info).toBeCalledTimes(1);
	expect(info).toBeCalledWith("Event type doesn't affect label");
	expect(initializeGit).not.toBeCalled();
});

test("MDFile throws error", () => {
	mockMDFile.mockImplementationOnce(() => { throw new Error(); });
	expect(main()).toBeUndefined();
	expect(setFailed).toBeCalledTimes(1);
	expect(setFailed).toBeCalledWith("Action failed");
});

describe("Label added actions", () => {
	for (const action of ["labeled", "reopened"]) {
		test(`${action} action, one file`, () => {
			(context as any).payload.action = action;
			expect(main()).toBeUndefined();
			expect(mockATL).toBeCalledTimes(1);
			expect(mockTS).toBeCalledTimes(1);
			expect(writeFileSync).toBeCalledTimes(1);
			expect(initializeGit).toBeCalledTimes(1);
			expect(commitAndPush).toBeCalledTimes(1);
		});
		test(`${action} action, multiple files`, () => {
			mockSplitF.mockImplementationOnce(() => ["./README.md", "otherFile.md", "andAnotherFile"]);
			(context as any).payload.action = action;
			expect(main()).toBeUndefined();
			expect(mockATL).toBeCalledTimes(3);
			expect(mockTS).toBeCalledTimes(3);
			expect(writeFileSync).toBeCalledTimes(3);
			expect(initializeGit).toBeCalledTimes(1);
			expect(commitAndPush).toBeCalledTimes(1);
		});
	}
});

describe("Label removed actions", () => {
	for (const action of ["unlabeled", "closed", "deleted"]) {
		test(`${action} action, one file`, () => {
			(context as any).payload.action = action;
			expect(main()).toBeUndefined();
			expect(mockRFL).toBeCalledTimes(1);
			expect(mockTS).toBeCalledTimes(1);
			expect(writeFileSync).toBeCalledTimes(1);
			expect(initializeGit).toBeCalledTimes(1);
			expect(commitAndPush).toBeCalledTimes(1);
		});
		test(`${action} action, multiple files`, () => {
			mockSplitF.mockImplementationOnce(() => ["./README.md", "otherFile.md", "andAnotherFile"]);
			(context as any).payload.action = action;
			expect(main()).toBeUndefined();
			expect(mockRFL).toBeCalledTimes(3);
			expect(mockTS).toBeCalledTimes(3);
			expect(writeFileSync).toBeCalledTimes(3);
			expect(initializeGit).toBeCalledTimes(1);
			expect(commitAndPush).toBeCalledTimes(1);
		});
		test(`${action} action, file fails`, () => {
			mockSplitF.mockImplementationOnce(() => ["./README.md", "otherFile.md", "andAnotherFile"]);
			mockRFL.mockImplementationOnce(() => 0);
			mockRFL.mockImplementationOnce(() => 1);
			(context as any).payload.action = action;
			expect(main()).toBeUndefined();
			expect(mockRFL).toBeCalledTimes(2);
			expect(setFailed).toBeCalledTimes(1);
			expect(setFailed).toBeCalledWith("Failed to remove issue #42 from Upcoming Features");
			expect(initializeGit).not.toBeCalled();
			expect(commitAndPush).not.toBeCalled();
		});
	}
});

describe("Labeled issue title edited", () => {
	const data: { [key: string]: string[]; } = {
		"one file": ["./README.md"],
		"multiple files": ["./README.md", "otherFile.md", "andAnotherFile"]
	};

	for (const files in data) {
		test(`title not edited, ${files}`, () => {
			mockSplitF.mockImplementationOnce(() => data[files]);
			(context as any).payload.action = "edited";
			(context as any).payload.changes = {
				body: {
					from: "Who put that there?"
				}
			};
			expect(main()).toBeUndefined();
			expect(info).toBeCalledTimes(1);
			expect(info).toBeCalledWith("Event type doesn't affect label");
			expect(mockELI).not.toBeCalled();
			expect(initializeGit).not.toBeCalled();
		});
		test(`title edited but not changed, ${files}`, () => {
			mockSplitF.mockImplementationOnce(() => data[files]);
			(context as any).payload.action = "edited";
			(context as any).payload.changes = {
				title: {
					from: "Issue title"
				}
			};
			expect(main()).toBeUndefined();
			expect(info).toBeCalledTimes(1);
			expect(info).toBeCalledWith("Event type doesn't affect label");
			expect(mockELI).not.toBeCalled();
			expect(initializeGit).not.toBeCalled();
		});
		test(`Failed to edit title, ${files}`, () => {
			mockSplitF.mockImplementationOnce(() => data[files]);
			mockELI.mockImplementationOnce(() => 1);
			(context as any).payload.action = "edited";
			(context as any).payload.changes = {
				title: {
					from: "Different issue title"
				}
			};
			expect(main()).toBeUndefined();
			expect(mockELI).toBeCalledTimes(1);
			expect(setFailed).toBeCalledTimes(1);
			expect(setFailed).toBeCalledWith("Failed to edit issue #42 in Upcoming Features");
			expect(initializeGit).not.toBeCalled();
			expect(commitAndPush).not.toBeCalled();
		});
		test(`title edited, ${files}`, () => {
			mockSplitF.mockImplementationOnce(() => data[files]);
			(context as any).payload.action = "edited";
			(context as any).payload.changes = {
				title: {
					from: "Different issue title"
				}
			};
			expect(main()).toBeUndefined();
			expect(mockELI).toBeCalledTimes(data[files].length);
			expect(writeFileSync).toBeCalledTimes(data[files].length);
			expect(initializeGit).toBeCalledTimes(1);
			expect(commitAndPush).toBeCalledTimes(1);
		});
	}
});