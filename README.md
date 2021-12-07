# edit-readme
A GitHub action to Add/remove issue titles to/from a list in your README when a label is added/removed.

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
- [ ] Think of a better name for the action
- [ ] Actually edit the readme and commit
- [ ] Ensure that the event is an IssueEvent in index.ts
- [ ] Write proper README with all the relevant info. Check LL course, notes & docs
- [ ] Finish writing tests
- [ ] Add a testign workflow
- [ ] Add test coverage test workflow badges to readme 
