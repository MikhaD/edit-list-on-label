import { Label } from "@octokit/webhooks-definitions/schema";
import { execSync } from "child_process";

/** Match a valid email address */
export const EMAIL_REGEX = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/m;

/**
 * Split a string containing a list of comma seperated values and return a list
 * @param list A string of one or more comma seperated valuese
 */
export function splitFiles(list: string) {
	return list.split(/\s*,\s*/);
}

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

/**
 * Initialize git to commit by setting user.email and user.name
 * @param email default: `action@github.com`
 * @param name default: `action`
 */
export function initializeGit(email = "action@github.com", name = "action") {
	if (!EMAIL_REGEX.test(email)) throw new SyntaxError("Invalid email syntax");
	execSync(`git config --global user.email ${email}`);
	execSync(`git config --global user.name ${name}`);
}

/**
 * Add, commit and push a list of files with the given message
 * @param files The list of files to push
 * @param message The commit message
 */
export function commitAndPush(files: string[], message: string) {
	execSync(`git add ${files.join(" ")}`);
	execSync(`git commit -m "${message}"`);
	execSync("git push");
}