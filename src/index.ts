import { getInput, setFailed } from "@actions/core";
import github from "@actions/github";
import { IssuesEvent } from "@octokit/webhooks-definitions/schema"
import MDFile from "./MDFile";
import { containsLabel } from "./utils";

const caseSensitive = (() => {
	const caseSensitive = getInput("case-sensitive").toLowerCase();
	return !(caseSensitive === "false" || caseSensitive === "0");
})();

const sectionName = caseSensitive ? getInput("heading") : getInput("heading").toLowerCase();
const labelName = getInput("label");

try {
	const readme = new MDFile("./README.md");
	const event = github.context.payload as IssuesEvent;
	const text = `(#${event.issue.number}) ${event.issue.title}`;

	const issueEventRelatedToLabel = (event.issue.labels && containsLabel(event.issue.labels, labelName)) ||
		("label" in event && event.label?.name === labelName);

	if (issueEventRelatedToLabel) {
		if (["labeled", "reopened"].includes(event.action)) {
			readme.addToList(sectionName, text);
		} else if (["unlabeled", "closed", "deleted"].includes(event.action)) {
			const status = readme.removeFromList(sectionName, text);
			if (status !== 0) {
				setFailed(`Failed to remove issue #${event.issue.number} from ${sectionName}`);
			}
		} else if (event.action === "edited" && (event.changes.title && event.changes.title.from !== event.issue.title)) {
			const oldListItem = `(#${event.issue.number}) ${event.changes.title.from}`;
			const status = readme.editListItem(sectionName, oldListItem, text);
			if (status !== 0) {
				setFailed(`Failed to edit issue #${event.issue.number} in ${sectionName}`);
			}
		} else {
			// exit and reflect that nothing was done in the action output
		}
		// edit the actual readme by writing readme.toString() to file and committing it
	}
} catch (e) {
	setFailed("Failed, see error");
}