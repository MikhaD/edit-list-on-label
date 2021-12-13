# edit-list-on-label
[![codecov coverage](https://img.shields.io/codecov/c/github/MikhaD/edit-list-on-label?logo=jest&token=EENAHP5UOG)](https://codecov.io/gh/MikhaD/edit-list-on-label)
![Testing Workflow](https://github.com/MikhaD/edit-list-on-label/workflows/Testing/badge.svg?branch=main)
![Version](https://img.shields.io/github/package-json/v/MikhaD/edit-list-on-label)

Add/remove issue titles to/from a list in your README and/or any other markdown files in your repo when a label is added/removed.

Whenever the label you specify in your workflow is added to an issue that issue's title will be added to a list in the markdown file or files of your choice.
When that label is removed or the issue is closed or deleted that item will be removed from the list(s).
See [functionality details](#functionality-details) for more.
# Usage
Needs to be in a workflow where the only event (`on` value) is issues, as it will fail for non issue events.
You do not need to be more specific about the type of issue event, the action handles that.
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
        # The heading in the markdown file(s) that you want to edit. If not present it
        # will be appended to the end.
        # Default: Upcoming Features
        heading: ""
        # Whether you want the heading to be case sensitive.
        # Default: true
        case-sensitive: ""
```
## Example Use Case
The default configuration is for the example use case where every time an issue is labeled "enhancement" The title of the issue is added to the readme under the heading **Upcoming Features**.<br>This repository uses this action for exactly this! See [Upcoming Features](#upcoming-features)!

# Functionality Details
<details>
<summary><strong>Where is the issue title added?</strong></summary>
 
 An issue's title is added to the *last list* under the specified heading in the given markdown files if there are multiple lists under that heading. If there are no lists it will place a list item as the last line under that heading.
<br>If multiple identical headings exist in a file the one with the highest heading level (# > ##) will be chosen. If multiple identical headings with the same level exist in a file the first one will be chosen. If the heading doesn't exist in the file it will be appended to the end of the file.
</details>
<details>
<summary><strong>When is the issue title added?</strong></summary>
 
 This action is called on every issue event, but only adds the issue title to the list if:
- The issue has been labeled with the specified label
- An issue with the specified label has been reopened
</details> 
<details>
<summary><strong>When is the issue title removed?</strong></summary>

The title of an issue with the specified label is removed from the list(s) when:
- The issue is closed
- The specified label is removed from the issue
- The issue is deleted
</details>
<details>
<summary><strong>What happens if an issue with the label has its title edited?</strong></summary>

If an issue with the specified label has its title edited the list item for that issue will be modifed to reflect the issue's new name.
</details>

# Upcoming Features
- (#3) Add option to specify format
- (#4) Add option to specify commit message
- (#5) Link to issue when $NUMBER is used in formats
- (#6) Option to only edit files that are present, or create files, instead of failing
# License
The scripts and documentation in this project are released under the [GNU General Public License v3.0](https://github.com/MikhaD/edit-list-on-label/blob/main/COPYING)<br>
Authored and maintained by [MikhaD](https://github.com/MikhaD).
