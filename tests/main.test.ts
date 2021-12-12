import { getInput, setFailed, info } from "@actions/core";
import { context } from "@actions/github";
import { IssuesEvent } from "@octokit/webhooks-definitions/schema";
import main from "../src/main";
import { containsLabel } from "../src/utils";

jest.mock("@actions/core", () => ({
	getInput: jest.fn((input) => {
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

jest.mock("@actions/github");

jest.mock("../src/utils", () => ({
	containsLabel: jest.fn(() => false),
	splitFiles: jest.fn(() => ["./README.md"])
}));

const defaultMock = {
	eventName: "issues",
	payload: {
		action: "labeled",
		issue: {
			number: 1,
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
		},
		// only here when action === "edited"
		// changes: {
		// 	// only here when the title changed
		// 	title: {
		// 		from: "string"
		// 	}
		// }
	} as IssuesEvent
};

beforeEach(() => {
	(context as any) = JSON.parse(JSON.stringify(defaultMock));
});

const mockContLab = containsLabel as jest.Mock;
const mockGI = getInput as jest.Mock;
const mockSF = setFailed as jest.Mock;
const mockInfo = info as jest.Mock;

test("Wrong event", () => {
	(context as any).eventName = "incorrect";
	expect(main()).toBeUndefined();
	expect(mockSF).toBeCalledWith("Action should only be triggered on issues event");
});

test("Irrelevant label", () => {
	(context as any).payload.issue.labels = [];
	(context as any).payload.label.name = "";
	expect(main()).toBeUndefined();
	expect(mockGI).toBeCalledTimes(4);
	expect(mockGI).toBeCalledWith("case-sensitive");
	expect(mockGI).toBeCalledWith("heading");
	expect(mockGI).toBeCalledWith("label");
	expect(mockGI).toBeCalledWith("files");
	expect(mockContLab).toBeCalledWith(context.payload.issue?.labels, "enhancement");
	expect(mockInfo).toBeCalledWith("Event not on labeled issue");
});



//todo mock fs.writefilesync