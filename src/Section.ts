import { Heading } from "./enums"

/**
 * A Section represents a markdown block between two headings,
 * starting with the heading up until the last line before the next heading.
 */
export default class Section {
	public static LIST_ITEM = /^ {0,3}(-|\+|\*)\s+/m;
	private _lines: string[];
	private _heading = "";
	headingType: Heading;
	constructor(heading?: string, headingType?: Heading) {
		this._lines = [];
		if (heading) this.setHeading(heading);
		this.headingType = headingType || Heading.none;
	}
	lineCount() {
		return this._lines.length - this.headingType;
	}
	addLine(line: string) {
		this._lines.push(line);
	}
	lastLine() {
		return this._lines.at(-1) || "";
	}
	popLastLine() {
		if (this.lineCount() > 0) {
			return this._lines.pop()!;
		} else {
			throw new RangeError("No last line to pop");
		}
	}
	/**
	 * Return copy of all the lines in the section, including the header
	 */
	getText() {
		return [...this._lines];
	}
	/**
	 * Set section heading to heading string after trimming and removing preceding #s and whitespace
	 * @param heading the value to set heading to
	 */
	setHeading(heading: string) {
		this._heading = heading.trim().replace(/^#+\s+/m, "");
	}
	/**
	 * Return the section heading, either as is or lower case if caseSensitive is false
	 * @param caseSensitive default: `true`
	 */
	getHeading(caseSensitive = true) {
		return caseSensitive ? this._heading : this._heading.toLowerCase();
	}
	/**
	 * Add to the last list found in the section, or append to the end of the section if no list is found
	 * @param value The value you want to add to the list.
	 */
	addToList(value: string) {
		for (let i = this.lineCount() + this.headingType - 1; i >= this.headingType; --i) {
			if (Section.LIST_ITEM.test(this._lines[i])) {
				this._lines.splice(i + 1, 0, `- ${value}`);
				return;
			}
		}
		this.addLine(`- ${value}`);
	}
	/**
	 * Remove the item from the last list found in the section and return 0, or return 1 if item could not be found
	 * @param value The value you want to remove from the list
	 */
	removeFromList(value: string) {
		for (let i = this.lineCount() + this.headingType - 1; i >= this.headingType; --i) {
			if (Section.LIST_ITEM.test(this._lines[i])) {
				if (this._lines[i].replace(Section.LIST_ITEM, "").trimEnd() === value.trim()) {
					this._lines.splice(i, 1);
					return 0;
				}
			}
		}
		return 1;
	}
}