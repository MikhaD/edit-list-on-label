import { Label } from "@octokit/webhooks-definitions/schema";

/**
 * Search though an array of labels and return true if one or more of the labels has the given name value
 * @param labels The array of labels
 * @param labelName The name of the label you are looking for
 */
export function containsLabel(labels: Label[], labelName: string) {
	for (const label of labels) {
		if (label.name === labelName) {
			return true;
		}
	}
	return false;
}