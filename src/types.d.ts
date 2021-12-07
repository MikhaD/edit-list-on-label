export const enum HeadingType {
	none = 0,
	hash = 1,
	underline = 2
}

export type headingLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type Heading = {
	readonly value: string,
	readonly type: HeadingType,
	readonly level: headingLevel
}