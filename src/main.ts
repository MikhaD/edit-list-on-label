import { getInput, setFailed, info } from "@actions/core";
import { context } from "@actions/github";
import { IssuesEvent } from "@octokit/webhooks-types";
import { writeFileSync } from "fs";
import MDFile from "./MDFile";
import { containsLabel, commitAndPush, splitFiles, initializeGit } from "./utils";

/** The main function, executed in index.ts, exported to make it testable */
export default function main() {
	if (context.eventName !== "issues") return setFailed("Action should only be triggered on issues event");

	const caseSensitive = (() => {
		const caseSensitive = getInput("case-sensitive").toLowerCase();
		return !(caseSensitive === "false" || caseSensitive === "0");
	})();
	const sectionName = caseSensitive ? getInput("heading") : getInput("heading").toLowerCase();
	const labelName = getInput("label");
	const files = splitFiles(getInput("files"));

	const event = context.payload as IssuesEvent;
	// If the issue event has nothing to do with the relevant label
	if ((!event.issue.labels || !containsLabel(event.issue.labels, labelName)) &&
		(!("label" in event) || event.label!.name !== labelName)) return info("Event not on labeled issue");

	try {
		const MDFiles = files.map((file) => new MDFile(file));
		const text = `(#${event.issue.number}) ${event.issue.title}`;

		if (["labeled", "reopened"].includes(event.action)) {
			MDFiles.map((file) => file.addToList(sectionName, text));
		} else if (["unlabeled", "closed", "deleted"].includes(event.action)) {
			const succeeded = MDFiles.every((file) => file.removeFromList(sectionName, text) === 0);
			if (!succeeded) {
				return setFailed(`Failed to remove issue #${event.issue.number} from ${sectionName}`);
			}
		} else if (event.action === "edited" && (event.changes.title && event.changes.title.from !== event.issue.title)) {
			const oldListItem = `(#${event.issue.number}) ${event.changes.title.from}`;
			const succeeded = MDFiles.every((file) => file.editListItem(sectionName, oldListItem, text) === 0);
			if (!succeeded) {
				return setFailed(`Failed to edit issue #${event.issue.number} in ${sectionName}`);
			}
		} else return info("Event type doesn't affect label");
		MDFiles.forEach((file) => writeFileSync(file.path, file.toString()));
		initializeGit();
		commitAndPush(files, `:zap: updated ${sectionName} section in ${files.join(", ")}`);
	} catch (e) {
		info(e as string);
		setFailed("Action failed");
	}
}