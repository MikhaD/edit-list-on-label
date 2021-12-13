/** The type of heading a Section starts with. */
export const enum HeadingType {
	none = 0,
	hash = 1,
	underline = 2
}

/** The number of #s before a heading. 0 means not a heading. */
export type headingLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** The properties of a heading. */
export type Heading = {
	readonly value: string,
	readonly type: HeadingType,
	readonly level: headingLevel;
};