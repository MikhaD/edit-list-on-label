import { readFileSync } from "fs";
import Section from "./Section";
import { HeadingType } from "./types";

/**  A Class representing a markdown file (.md or .markdown) */
export default class MDFile {
	public readonly caseSensitive;
	public readonly path;

	private sections: Section[] = [];
	private sectionMap = new Map<string, Section>();
	private lines: string[];
	/**
	 * A Class representing a markdown file (.md or .markdown)
	 * @param path The path to the markdown file
	 * @param caseSensitive Whether or not to treat headings in the file as case sensitive
	 */
	constructor(path: string, caseSensitive = true) {
		if (!path.toLowerCase().endsWith(".md") && !path.toLowerCase().endsWith(".markdown")) {
			throw new TypeError(`${path} is not a markdown file`);
		}
		this.path = path;
		this.lines = readFileSync(path).toString().split("\n");
		this.caseSensitive = caseSensitive;
		this.section();
	}
	/**
	 * Add the section to the list of Sections and insert it into the map of Sections using its heading as a
	 * key. If a Section already exists under that key compare heading levels and keep the lowest, or if they
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
	/**
	 * Internal method to break the markdown file into a list of Sections, and a hashmap of headings to
	 * sections.
	 */
	private section() {
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
	/**
	 * Add item to the last list found in the Section, or append to the end of the Section if no list is found.
	 * @param section The Setion to look for the list in
	 * @param item The item to add to the list
	 */
	addToList(section: string, item: string) {
		if (!this.caseSensitive) section = section.toLowerCase();
		if (!this.sectionMap.has(section)) {
			this.insertSection(new Section([`# ${section}`], HeadingType.hash));
		}
		this.sectionMap.get(section)!.addToList(item);
	}
	/**
	 * Remove an item from the last list found in the Section and return 0, or return 1 if item or Section
	 * could not be found.
	 * @param section The section to look for the list in
	 * @param item The item to remove from the list
	 */
	removeFromList(section: string, item: string) {
		if (!this.caseSensitive) section = section.toLowerCase();
		if (!this.sectionMap.has(section)) return 1;
		return this.sectionMap.get(section)!.removeFromList(item);
	}
	/**
	 * Change `oldText` to the `newText` in the first list found in the Section and return 0, or return 1 if
	 * `oldText` or the Section can't be found.
	 * @param section The section to look for the list in
	 * @param oldText The text to replace
	 * @param newText The new text
	 */
	editListItem(section: string, oldText: string, newText: string) {
		if (!this.caseSensitive) section = section.toLowerCase();
		if (!this.sectionMap.has(section)) return 1;
		return this.sectionMap.get(section)!.editListItem(oldText, newText);
	}
	/** Call `toString` on each section and join them with `\n`, returning a single string */
	toString() {
		return this.sections.map(sect => sect.toString()).join("\n");
	}
	/** Return the number of unique sections in the file */
	totalUniqueSections() {
		return this.sectionMap.size;
	}
	/** Return the number of sections in the file */
	totalSections() {
		return this.sections.length;
	}
}