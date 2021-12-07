---
---
I wonder how it will
handle these lines at the top
# edit-readme
A GitHub action to edit a repositories README file.
## Goal
The main goal if this project is to learn how to create custom GitHub actions. I will also be using this repo to test various features of GitHub workflows.

# Testing Section
This is my testing section. If all goes well this is the section that will be edited by the script.

Does it detect this heading
----------------
and this as content?

What# about this
======
and this as content


If the first line is --- and so is the second they are both hrs
if first is === and second is --- or === treat as heading

# Cases:
All of these cases need tests written for them

--- under text:				Heading
--- under ===:				Heading
--- under === under text:	Not Heading
--- under ---:				Not Heading
--- under blank line		Not Heading
--- at beginning			Not Heading


=== under text:				Heading
=== under ===:				Heading
=== under === under text:	Not Heading
=== under ---:				Not Heading
=== under blank line		Not Heading
=== at beginning			Not Heading

no headings
multiple identical headings (with and without case sensitivity on)
\# type heading at the beginning of the file
empty file

(try to write tests for every branch)

What if readme doesn't exist?

Need an action to be triggered on issue rename if issue is labeled with the relevant label.

# To Do
Refactor sectionMarkdown to use an array as a temp instead of a section
Refactor Section to take an array instead of being able to add lines/ pop last line
Refactor Section to return the total length of the section, if you want the length - heading you need to do that manually.
Return a list of ordered lists of Sections from sectionMarkdown. Edit highest level one