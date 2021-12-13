import { Heading, headingLevel, HeadingType } from "./types";

/**
 * A Section represents a markdown block between two headings, starting with the heading up until the last
 * line before the next heading.
 */
export default class Section {
	public static readonly LIST_ITEM = /^ {0,3}(-|\+|\*)\s+/m;
	public static readonly HASH_HEADING = /^\s*#{1,6}\s+/m;
	public static readonly EQUALS_LINE = /^\s*={3,}\s*$/m;
	public static readonly DASH_LINE = /^\s*-{3,}\s*$/m;
	public readonly heading: Heading;
	private _lines: string[];
	/**
	 * A Section represents a markdown block between two headings, starting with the heading up until the last
	 * line before the next heading.
	 * @param lines The array of lines in this section
	 * @param headingType The type of heading this section starts with
	 */
	constructor(lines: string[], headingType: HeadingType) {
		if (lines.length === 0) throw new Error("Cannot create an empty, headingless section");
		if (lines.length === 1 && headingType === HeadingType.underline) {
			throw new Error("Cannot have underline heading with only one line");
		}
		this._lines = [...lines];

		let level: headingLevel;
		const hashHeadingLevel = Section.getHashHeadingLevel(lines[0]);
		if (headingType === HeadingType.underline) {
			if (hashHeadingLevel !== 0) throw new Error("Incorrect heading type");
			if (Section.DASH_LINE.test(lines[0])) throw new Error("Invalid heading");
			if (Section.EQUALS_LINE.test(lines[1])) level = 1;
			else if (Section.DASH_LINE.test(lines[1])) level = 2;
			else throw new Error("Underline heading has missing or invalid underline");
		} else {
			level = hashHeadingLevel;
		}
		if (level === 0 && headingType !== HeadingType.none) throw new Error("Invalid heading");
		if (level !== 0 && headingType === HeadingType.none) throw new Error("Incorrect heading type");

		this.heading = {
			value: (headingType !== HeadingType.none) ? Section.formatHeading(lines[0]) : "",
			type: headingType,
			level: level
		};
	}
	/**
	 * Add item to the last list found in the section, or append to the end of the section if no list is found.
	 * @param item The item to add to the list
	 */
	addToList(item: string) {
		for (let i = this._lines.length - 1; i >= this.heading.type; --i) {
			if (Section.LIST_ITEM.test(this._lines[i])) {
				this._lines.splice(i + 1, 0, `- ${item}`);
				return;
			}
		}
		this._lines.push(`- ${item}`);
	}
	/**
	 * Remove the item from the last list found in the section and return 0, or return 1 if item could not be
	 * found.
	 * @param item The item to remove from the list
	 */
	removeFromList(item: string) {
		for (let i = this._lines.length - 1; i >= this.heading.type; --i) {
			if (Section.LIST_ITEM.test(this._lines[i])) {
				if (this._lines[i].replace(Section.LIST_ITEM, "").trimEnd() === item.trim()) {
					this._lines.splice(i, 1);
					return 0;
				}
			}
		}
		return 1;
	}
	/**
	 * Change `oldText` to the `newText` in the first list found in the Section and return 0, or return 1 if
	 * `oldText` can't be found.
	 * @param oldText The text to replace
	 * @param newText The new text
	 */
	editListItem(oldText: string, newText: string) {
		for (let i = this._lines.length - 1; i >= this.heading.type; --i) {
			if (Section.LIST_ITEM.test(this._lines[i])) {
				if (this._lines[i].replace(Section.LIST_ITEM, "").trimEnd() === oldText.trim()) {
					this._lines.splice(i, 1, `- ${newText}`);
					return 0;
				}
			}
		}
		return 1;
	}
	/** Return the section as a single string, with the lines joined with `\n` */
	toString() {
		return this._lines.join("\n");
	}
	/**
	 * Remove preceding #s and trim
	 * @param heading the heading line to format
	 */
	static formatHeading(heading: string) {
		return heading.trim().replace(/^#+\s+/m, "");
	}
	/**
	 * Return the heading level of a given string, where the level represents the number of #s before the
	 * heading, with a value of 0 indicating that the line is not a heading.
	 * @param heading The line to evaluate the heading level of
	 */
	static getHashHeadingLevel(heading: string): headingLevel {
		const hashCount1 = (heading.match(/#/g) || []).length;
		const hashCount2 = (Section.formatHeading(heading).match(/#/g) || []).length;
		const hashes = hashCount1 - hashCount2;
		return ((hashes <= 6 && hashes >= 0) ? hashes as headingLevel : 0);
	}
}