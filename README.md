# edit-list-on-label
[![codecov coverage](https://img.shields.io/codecov/c/github/MikhaD/edit-list-on-label?logo=jest&token=EENAHP5UOG)](https://codecov.io/gh/MikhaD/edit-list-on-label)
![Testing Workflow](https://github.com/MikhaD/edit-list-on-label/workflows/Testing/badge.svg?branch=main)
![Version](https://img.shields.io/github/package-json/v/MikhaD/edit-list-on-label)

Add/remove issue titles to/from a list in your README and/or any other markdown files in your repo when a label is added/removed.
# Usage
Needs to be in a workflow where the only event (on value) is issues, as it will fail for non issue events.
```yaml
on: issues

jobs:
  edit-list-on-label:
	runs-on: ubuntu-latest
	steps:
	  - uses: actions/checkout@v2

      - uses: MikhaD/edit-list-on-label
        with:
		  # A comma seperated list of the relative paths to the files you want to modify
		  # Default: ./README
	      files: ""
		  # The label you want the event to trigger on.
		  # Default: enhancement
		  label: ""
		  # The heading in the markdown file(s) that you want to edit. If not present it will be appended to the end.
		  # Default: Upcoming Features
		  heading: ""
		  # Whether you want the heading to be case sensitive.
		  # Default: true
		  case-sensitive: ""
```