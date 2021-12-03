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
--- under text:				Heading
--- under ===:				Heading
--- under === under text:	Not Heading
--- under ---:				Not Heading

=== under text:				Heading
=== under ===:				Heading
=== under === under text:	Not Heading
=== under ---:				Not Heading

no headings
multiple identical headings (with and without case sensitivity on)


What if readme doesn't exist?