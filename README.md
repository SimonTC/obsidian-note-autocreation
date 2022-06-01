# Note Auto Creator for Obsidian

Automatically create notes when links are created to them.

## How to use
![demo](https://raw.githubusercontent.com/SimonTC/obsidian-note-autocreation/master/NAC%20demo.gif)

After enabling the plugin in the settings menu, you will be able to trigger an alternative link suggestion drop-down. 
The drop-down is triggered by typing the characters configured in the settings menu. By default, the trigger is `@`.
The suggestion drop-down works as the standard link suggestion activated by typing `[[` with some notable differences:

|                                                                   | Obsidian Linking   | Note Auto Creator linking     |
|-------------------------------------------------------------------|--------------------|-------------------------------|
| Trigger for link suggestion                                       | `[[`               | Configurable (`@` by default) |
| Inserts link to note when Enter is pressed                        | ✔️ | ✔️            |     
| Creates new note if no note exist at the link location            | ❌                | ✔️            |     
| Filters link suggestions based on the text after the trigger      | ✔️ | ✔️            |     
| Custom display text can be inserted by using the &#124; character | ✔️ | ✔️           |     
| Link to specific header can be inserted using the # character     | ✔️ | ❌                           |
| Link to specific block can be inserted using the ^ character      | ✔️ | ❌                           |

Some general notes:
- To exit out of the note selection process, press `ESC`. Note that the drop-down will be shown again as soon as you being writing on the same line.
- The type of link that is created by the Note Auto Creator is the same type of link that is created when using the standard Obsidian way. If [[Wikilinks]] have been enabled, then wikilinks are used. Otherwise markdown links are used. 
- The new note that is created when using the Note Auto Creator will be an empty note.
- The sorting of the suggestions is note quite the same between the two link insertion methods, but the contents are the same.

## Settings
In the settings tab you can configure what string to use to trigger the link suggestion drop-down.
By default, `@` is used to trigger the link selection, but you can configure it to be any string.
A warning is shown if the chosen trigger is either an empty string or among the [special symbols used when writing markdown](https://www.markdownguide.org/basic-syntax/#characters-you-can-escape).
You can choose to ignore the warning and still use any of the special symbols as triggers, but it will make it harder to write normal markdown since you always will have the drop-down show up.

## Compatibility
This plugin should work on all operating systems supported by Obsidian, but has not been tested everywhere. See the table below for tested systems:

| Device       | Tested 			         | Working            |
|--------------|--------------------|--------------------|
| Windows 10 + 11   | ✔️ | ✔️ |
| Android (11) | ✔️ | ✔️ |
| iPad         | ✔️                | ✔️    |
| iPhone 			   | ❌                | ❔    |
| Linux        | ✔️                | ✔️    |

## Upcoming features
- Apply Templater templates to new notes
- Respect default location for new notes configured in core Obsidian
- Set specific top folders to collect note suggestions from

## How to install

### From within Obsidian
You activate the plugin from within Obsidian by doing the following:
- Open Settings > Community plugins
- Make sure Safe mode is off
- Click Browse community plugins
- Search for "Note Auto Creator"
- Click Install
- Once installed, close the community plugins window and activate the newly installed plugin

### From GitHub

1. Download the Latest Release from the Releases section of the GitHub Repository
2. Put files to your vault's plugins folder: `<vault>/.obsidian/plugins/obsidian-note-autocreation`
3. Reload Obsidian
4. If prompted about Safe Mode, you can disable safe mode and enable the plugin.
   Otherwise, head to Settings, third-party plugins, make sure safe mode is off and
   enable the plugin from there.
