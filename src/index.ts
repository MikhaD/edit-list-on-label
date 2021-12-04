import { getInput, setFailed } from "@actions/core";
import { readFileSync } from "fs";
import { sectionMarkdown } from "./parseMarkdown";


import { execSync } from 'child_process';
import { exit } from "process";
const output = execSync('ls', { encoding: 'utf-8' });
console.log(`ls Output was:\n${output}`);


const caseSensitiveInput = getInput("case-sensitive").toLowerCase();
const caseSensitive = (caseSensitiveInput === "true" || caseSensitiveInput === "1");
// const caseSensitive = true;

const section = caseSensitive ? getInput("section") : getInput("section").toLowerCase();

try {
	const buffer = readFileSync("./README.md");
	const lines = buffer.toString().split("\n");

	const sections = sectionMarkdown(lines, caseSensitive);
	console.log(sections);

	const relsec = sections.get(section);
	if (relsec === undefined) {
		setFailed("Specified section does not exist");
		exit();
	}

} catch (e) {
	setFailed("Failed, see error");
	console.log(e);
}