# Note Auto Creator for Obsidian

Automatically create notes when links are created to them.

## How to use
![demo](https://raw.githubusercontent.com/SimonTC/obsidian-note-autocreation/master/readme_assets/NAC%20demo.gif)

After enabling the plugin in the settings menu, you will be able to trigger an alternative link suggestion drop-down. 
The drop-down is triggered by typing the characters configured in the settings menu. By default, the trigger is `@`.
The suggestion drop-down works as the standard link suggestion activated by typing `[[` with some notable differences:

|                                                                                                        | Obsidian Linking | Note Auto Creator linking                                                             |
|--------------------------------------------------------------------------------------------------------|------------------|---------------------------------------------------------------------------------------|
| Trigger for link suggestion                                                                            | `[[`             | Configurable (`@` by default)                                                         |
| Inserts link to note when Enter is pressed                                                             | ✔️               | ✔️                                                                                    |     
| Creates new note if no note exist at the link location                                                 | ❌                | ✔️                                                                                    |     
| Can apply a [Templater](https://github.com/SilentVoid13/Templater) template when a new note is created | ❌                | ✔️ <br/> Triggered by `$` by default but can be configured                            |
| Filters link suggestions based on the text after the trigger                                           | ✔️               | ✔️                                                                                    |     
| Custom display text can be inserted by using the &#124; character                                      | ✔️               | ✔️                                                                                    |     
| Link to specific header can be inserted using the # character                                          | ✔️               | ❌                                                                                     |
| Link to specific block can be inserted using the ^ character                                           | ✔️               | ❌                                                                                     |
| Adds new root notes in the default location specified in "Default location for new notes"              | ✔️               | ✔️                                                                                    |
| Can search for notes by alias                                                                          | ✔️               | ✔️                                                                                    |
| Can disable suggestions for links to notes that do not exist                                           | ❌                | ✔️<br/>Links to non-existing notes are suggested by default, but this can be disabled |

Some general notes:
- To exit out of the note selection process, press `ESC`. Note that the drop-down will be shown again as soon as you being writing on the same line.
- The type of link that is created by the Note Auto Creator is the same type of link that is created when using the standard Obsidian way. If [[Wikilinks]] have been enabled, then wikilinks are used. Otherwise markdown links are used. 
- The new note that is created when using the Note Auto Creator will be an empty note unless a template is applied.
- The sorting of the suggestions is note quite the same between the two link insertion methods, but the contents are the same.

### Inserting templates
![template demo](https://raw.githubusercontent.com/SimonTC/obsidian-note-autocreation/master/readme_assets/NAC-template%20demo.gif)

If you would like to apply a template to a new note you can achieve this by triggering the template selection drop-down by writing the template selection trigger (`$` by default).
This will change the note selection drop-down to a template selection drop-down, and you will be able to select which template to insert.
When you have selected a template, the note will be created and the selected template will be applied to the note.
[Templater](https://github.com/SilentVoid13/Templater) is used to apply the template. 

**Prerequisites and limitations**
- You may need to restart Obsidian after adding Templater or Note Auto Creator. Otherwise, Note Auto Creator might not be aware of the template folder configured in Templater.
- Inserting templates only works if the Templater plugin is installed and enabled.
- You need to have defined a template folder in Templater
- Inserting templates does not work with templates created for the [core Templates plugin](https://help.obsidian.md/Plugins/Templates).
- You cannot apply templates to already existing notes.

## Settings

### Link suggestion trigger

By default, `@` is used to trigger the link selection, but you can configure it to be any string by changing the value in `Trigger for link selection`.

A warning is shown if the chosen trigger is either an empty string or among the [special symbols used when writing markdown](https://www.markdownguide.org/basic-syntax/#characters-you-can-escape).
You can choose to ignore the warning and still use any of the special symbols as triggers, but it will make it harder to write normal markdown since you always will have the drop-down show up.

### Suggest existing links to notes that do not exist
By default, Note Auto Creator will suggest links to notes that have not been created if such links have been inserted in other files.
Disabling this feature will hide suggestions for links to notes that do not exist. 

### Template insertion trigger
Any symbol can be used to trigger the selection of a template to insert. By default, the trigger symbol is `$`. This symbol can be configured by changing the value in `Trigger for template execution`.
This setting is only shown when Templater is installed and enabled.

## Compatibility
This plugin should work on all operating systems supported by Obsidian, but has not been tested everywhere. See the table below for tested systems:

| Device          | Tested 			 | Working |
|-----------------|------------|---------|
| Windows 10 + 11 | ✔️         | ✔️      |
| Android (11)    | ✔️         | ✔️      |
| iPad            | ✔️         | ✔️      |
| iPhone 			      | ❌          | ❔       |
| Linux           | ✔️         | ✔️      |

## Todo
- [ ] Set specific top folders to collect note suggestions from
- [ ] Enable header linking if inserting a link to an existing note
- [X] Support searching for notes by alias

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
