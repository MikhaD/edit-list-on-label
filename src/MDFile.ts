import { readFileSync } from "fs";
import Section from "./Section";
import { HeadingType } from "./types";

export default class MDFile {
	public readonly caseSensitive;

	private sections: Section[] = [];
	private sectionMap = new Map<string, Section>();
	private lines: string[];

	constructor(path: string, caseSensitive = true) {
		if (!path.toLowerCase().endsWith(".md") && !path.toLowerCase().endsWith(".markdown")) {
			throw new TypeError(`${path} is not a markdown file`);
		}
		this.lines = readFileSync(path).toString().split("\n");
		this.caseSensitive = caseSensitive;
		this.section();
	}
	/**
	 * Add the section to the list of Sections and insert it into the map of sections using its heading as a
	 * key. If a section already exists under that key compare heading levels and keep the lowest, or if they
	 * are the same keep the old one.
	 * @param newSection The Section to try and insert
	 */
	private insertSection(newSection: Section) {
		this.sections.push(newSection);

		const key = this.caseSensitive ? newSection.heading.value : newSection.heading.value.toLowerCase();
		const oldSection = this.sectionMap.get(key);

		if (oldSection && oldSection.heading.level <= newSection.heading.level) return;
		this.sectionMap.set(key, newSection);
	}

	private section() {
		const sections = new Map<string, Section>();
		let currentSection: string[] = [];
		let currentHeadingType = HeadingType.none;
		for (const line of this.lines) {
			if (Section.HASH_HEADING.test(line)) {
				// If Heading is not the first line
				if (currentSection.length > 0) {
					this.insertSection(new Section(currentSection, currentHeadingType));
					currentSection = [];
				}
				currentHeadingType = HeadingType.hash;
				// Check if the line is just 3 or more dashes or equals signs & that its not the first line
			} else if ((Section.EQUALS_LINE.test(line) || Section.DASH_LINE.test(line)) && currentSection.length > 0) {
				// Check the line before, if not blank and not ---: heading
				if (currentSection.at(-1)!.length > 0 && !Section.DASH_LINE.test(currentSection.at(-1)!)) {
					// If this heading is not the first 2 lines
					if (currentSection.length > 1) {
						this.insertSection(new Section(currentSection.slice(0, -1), currentHeadingType));
						currentSection = currentSection.slice(-1);
					}
					currentHeadingType = HeadingType.underline;
				}
			}
			currentSection.push(line);
		}

		if (currentSection.length > 0) {
			this.insertSection(new Section(currentSection, currentHeadingType));
		}
	}

	addToList(section: string, item: string) {
		if (!this.sectionMap.has(section)) {
			const newSection = new Section([`# ${section}`], HeadingType.hash);
			this.sectionMap.set(section, newSection);
			this.sections.push(newSection);
		}
		this.sectionMap.get(section)!.addToList(item);
	}
	removeFromList(section: string, item: string) {
		if (!this.sectionMap.has(section)) return 1;
		return this.sectionMap.get(section)!.removeFromList(item);
	}
	editListItem(section: string, oldItem: string, newItem: string) {
		if (!this.sectionMap.has(section)) return 1;
		return this.sectionMap.get(section)!.editListItem(oldItem, newItem);
	}
	toString() {
		return this.sections.map(sect => sect.toString()).join("\n");
	}
}