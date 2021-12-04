import { Heading } from "./enums"

export default class Section {
	private _lines: string[];
	heading = "";
	headingType: Heading;
	constructor(heading?: string, headingType?: Heading, caseSensitive = false) {
		this._lines = [];
		if (heading) this.setHeading(heading, caseSensitive);
		this.headingType = headingType || Heading.none;
	}
	lines() {
		return this._lines.length - this.headingType;
	}
	addLine(line: string) {
		this._lines.push(line);
	}
	lastLine() {
		return this._lines.at(-1) || "";
	}
	popLastLine() {
		if (this.lines() > 0) {
			return this._lines.pop()!;
		} else {
			throw new RangeError("No last line to pop");
		}
	}
	setHeading(heading: string, caseSensitive?: boolean) {
		heading = caseSensitive ? heading : heading.toLowerCase();
		// trim heading then remove preceding #s and whitespace
		this.heading = heading.trim().replace(/^#+\s+/m, "");
	}
	/**
	 * Add to the last list found in the section, or append to the end of the section if no list is found
	 * @param value The value you want to add to the list.
	 */
	addToList(value: string) {
		for (let i = this.lines.length - 1; i >= this.headingType; --i) {
			if (/^(-|\+|\*)\s+/m.test(this._lines[i])) {
				this._lines.splice(i + 1, 0, `- ${value}`);
			}
		}
	}
	/**
	 * Remove the item from the last list found in the section and return 0, or return 1 if item could not be found
	 * @param value The value you want to remove from the list
	 */
	removeFromList(value: string) {
		for (let i = this.lines.length - 1; i >= this.headingType; --i) {
			if (/^(-|\+|\*)\s+/m.test(this._lines[i])) {
				if (this._lines[i].includes(value)) {
					this._lines.splice(i, 1);
				}
			}
		}
	}
}