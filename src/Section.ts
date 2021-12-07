import { Heading, headingLevel, HeadingType } from "./types"

/**
 * A Section represents a markdown block between two headings,
 * starting with the heading up until the last line before the next heading.
 */
export default class Section {
	public static readonly LIST_ITEM = /^ {0,3}(-|\+|\*)\s+/m;
	public static readonly HASH_HEADING = /^\s*#{1,6}\s+/m;
	public static readonly EQUALS_LINE = /^\s*={3,}\s*$/m;
	public static readonly DASH_LINE = /^\s*-{3,}\s*$/m;
	public readonly heading: Heading;
	private _lines: string[];

	constructor(lines: string[], headingType: HeadingType) {
		if (lines.length === 0) throw new Error("Cannot create an empty, headingless section");
		if (lines.length === 1 && headingType === HeadingType.underline) {
			throw new Error("Cannot have underline heading with only one line");
		}

		this._lines = lines;
		Object.freeze(this._lines);

		let level: headingLevel;
		switch (headingType) {
			case HeadingType.hash:
				level = Section.getHashHeadingLevel(lines[0]);
				break;
			case HeadingType.underline:
				if (Section.EQUALS_LINE.test(lines[1])) level = 1;
				else if (Section.DASH_LINE.test(lines[1])) level = 2;
				else throw new Error("Underline heading has missing or invalid underline");
				break;
			default:
				level = 0;
		}

		this.heading = {
			value: (headingType !== HeadingType.none) ? Section.formatHeading(lines[0]) : "",
			type: headingType,
			level: level
		};
	}
	/**
	 * Add item to the last list found in the section, or append to the end of the section if no list is found
	 * @param item The item you want to add to the list.
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
	 * Remove the item from the last list found in the section and return 0, or return 1 if item could not be found
	 * @param item The item you want to remove from the list
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
	 * Change the oldItem to the newItem in the first list found in the section with the oldItem and return 0,
	 * or return 1 if oldItem can't be found
	 * @param oldItem The item you want to replace in the list
	 * @param newItem The item you want to replace it with
	 */
	editListItem(oldItem: string, newItem: string) {
		for (let i = this._lines.length - 1; i >= this.heading.type; --i) {
			if (Section.LIST_ITEM.test(this._lines[i])) {
				if (this._lines[i].replace(Section.LIST_ITEM, "").trimEnd() === oldItem.trim()) {
					this._lines.splice(i, 1, `- ${newItem}`);
					return 0;
				}
			}
		}
		return 1;
	}
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
	static getHashHeadingLevel(heading: string): headingLevel {
		const hashCount1 = (heading.match(/#/g) || []).length;
		const hashCount2 = (Section.formatHeading(heading).match(/#/g) || []).length;
		const hashes = hashCount1 - hashCount2;
		return ((hashes <= 6 && hashes >= 0) ? hashes as headingLevel : 0);
	}
}