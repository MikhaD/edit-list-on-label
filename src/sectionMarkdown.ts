import { Heading } from "./enums";
import Section from "./Section";

export default function sectionMarkdown(lines: string[], caseSensitive = false) {
	const sections = new Map<string, Section>();
	let currentSection: Section = new Section();
	for (const line of lines) {
		// Detects 1 or more #s at the beginning of a line
		if (/^\s*#{1,6}\s+/m.test(line)) {
			// If Heading is on the first line
			if (currentSection.lines() === 0 && currentSection.headingType === Heading.none) {
				currentSection.setHeading(line, caseSensitive);
				currentSection.headingType = Heading.hash;
			} else {
				if (!sections.has(currentSection.heading)) {
					sections.set(currentSection.heading, currentSection);
				}
				currentSection = new Section(line, Heading.hash, caseSensitive);
			}

			// Detects if the line is just 3 or more dashes or equals signs
		} else if (/^(-|=){3,}\s*$/m.test(line) && currentSection.lines() > 0) {
			// Check the line before, if not blank and not ---: heading
			if (currentSection.lastLine().length > 0 && !/^-{3,}\s*$/m.test(currentSection.lastLine())) {
				const heading = currentSection.popLastLine();
				if (!sections.has(currentSection.heading)) {
					sections.set(currentSection.heading, currentSection);
				}
				currentSection = new Section(heading, Heading.underline, caseSensitive);
				currentSection.addLine(heading);
			}
		}
		currentSection.addLine(line);
	}

	if ((currentSection.lines() > 0 || currentSection.headingType !== Heading.none) && !sections.has(currentSection.heading)) {
		sections.set(currentSection.heading, currentSection);
	}
	return sections;
}