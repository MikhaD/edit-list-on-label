import { getInput } from "@actions/core";
import { readFileSync } from "fs";
import sectionMarkdown from "./sectionMarkdown";


import { execSync } from 'child_process';
const output = execSync('ls', { encoding: 'utf-8' });
console.log('Output was:\n', output);


const section = getInput("section");
const caseSensitiveInput = getInput("case-sensitive").toLowerCase();

const caseSensitive = (caseSensitiveInput === "true" || caseSensitiveInput === "1");
// const caseSensitive = true;

try {
	const buffer = readFileSync("../README.md");
	const lines = buffer.toString().split("\n");

	const sections = sectionMarkdown(lines, caseSensitive);
	console.log(sections);
	console.log("##############################################");
	console.log(sections.get(section));
} catch (e) {
	console.log("Failed to read readme");
	console.log(e);
}