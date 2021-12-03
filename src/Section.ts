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
		this.heading = heading.trim().replace(/^#+\s+/m, "");;
	}
}