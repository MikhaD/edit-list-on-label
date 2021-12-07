import { Heading } from "./enums";
import Section from "./Section";
/**
 * Return a list of section objects for each unique heading in the markdown file
 * @param lines The lines of markdown to parse
 * @param caseSensitive default: `false`
 */
export function sectionMarkdown(lines: string[], caseSensitive = false) {
	const sections = new Map<string, Section>();
	let currentSection: Section = new Section();
	for (const line of lines) {
		if (isHashHeading(line)) {
			// If Heading is on the first line
			if (currentSection.lineCount() === 0 && currentSection.headingType === Heading.none) {
				currentSection.setHeading(line);
				currentSection.headingType = Heading.hash;
			} else {
				if (!sections.has(currentSection.getHeading(caseSensitive))) {
					sections.set(currentSection.getHeading(caseSensitive), currentSection);
				}
				currentSection = new Section(line, Heading.hash);
			}

			// Detects if the line is just 3 or more dashes or equals signs
		} else if ((isEqualsLine(line) || isDashLine(line)) && currentSection.lineCount() > 0) {
			// Check the line before, if not blank and not ---: heading
			if (currentSection.lastLine().length > 0 && !isDashLine(currentSection.lastLine())) {
				// If heading is the first 2 lines
				if (currentSection.lineCount() === 1 && currentSection.headingType === Heading.none) {
					currentSection.setHeading(currentSection.lastLine());
					currentSection.headingType = Heading.underline;
				} else {
					if (!sections.has(currentSection.getHeading(caseSensitive))) {
						sections.set(currentSection.getHeading(caseSensitive), currentSection);
					}
					const newHeading = currentSection.popLastLine();
					currentSection = new Section(newHeading, Heading.underline);
					currentSection.addLine(newHeading);
				}
			}
		}
		currentSection.addLine(line);
	}

	if ((currentSection.lineCount() > 0 || currentSection.headingType !== Heading.none) && !sections.has(currentSection.getHeading(caseSensitive))) {
		sections.set(currentSection.getHeading(caseSensitive), currentSection);
	}
	return sections;
}

/**
 * Detect if the first non whitespace charcters in the line are 1-6 hashes,
 * followed by a whitespace character.
 * @param line The line to check
 */
export function isHashHeading(line: string) {
	return /^\s*#{1,6}\s+/m.test(line);
}

/**
 * Detect if first non whitespace characters are 3 or more consecutive -s and
 * the line doesn't contain any other characters, other than optional whitespace
 * after the last =.
 * @param line The line to check
 */
export function isEqualsLine(line: string) {
	return /^\s*={3,}\s*$/m.test(line);
}

/**
 * Detect if first non whitespace characters are 3 or more consecutive -s and
 * the line doesn't contain any other characters, other than optional whitespace
 * after the last -.
 * @param line The line to check
 */
export function isDashLine(line: string) {
	return /^\s*-{3,}\s*$/m.test(line);
}