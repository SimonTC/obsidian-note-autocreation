# Note Auto Creator for Obsidian

Automatically create notes when links are created to them.

## How to use
<img src="NAC demo.gif" alt="Gif showing a demo of the plugin"/>

After enabling the plugin in the settings menu, you will be able to trigger an alternative link suggestion drop-down. 
The drop-down is triggered by typing the characters configured in the settings menu. By default, the trigger is `@`.
The suggestion drop-down works as the standard link suggestion activated by typing `[[` with some notable differences:

|                                                                     | Obsidian Linking   | Note Auto Creator linking     |
|---------------------------------------------------------------------|--------------------|-------------------------------|
| Trigger for link suggestion                                         | `[[`               | Configurable (`@` by default) |
| Inserts link to note when Enter is pressed                          | :heavy_check_mark: | :heavy_check_mark:            |     
| Creates new note if no note exist at the link location              | :x:                | :heavy_check_mark:            |     
| Filters link suggestions based on the text after the trigger        | :heavy_check_mark: | :heavy_check_mark:            |     
| Custom display text can be inserted by using the `&#124;` character | :heavy_check_mark: | :heavy_check_mark:            |     
| Link to specific header can be inserted using the `#` character     | :heavy_check_mark: | :x:                           |
| Link to specific block can be inserted using the `^` character      | :heavy_check_mark: | :x:                           |

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

| Device               | Tested 			         | Working            |
|----------------------|--------------------|--------------------|
| Windows 10           | :heavy_check_mark: | :heavy_check_mark: |
| Android (11)         | :heavy_check_mark: | :heavy_check_mark: |
| iPad (iPadOS 15.4.1) | :x:                | :grey_question:    |
| iPhone 			           | :x:                | :grey_question:    |
| Linux                | :x:                | :grey_question:    |


## How to install

### From within Obsidian
You activate the plugin from within Obsidian by doing the following:
- Open Settings > Community plugins
- Make sure Safe mode is off
- Click Browse community plugins
- Search for "Note Auto Creator"
- Click Install
- Once installed, close the community plugins window and activate the newly installed plugin

### Manually
- Copy over `main.js`, `styles.css`, `manifest.json` to your vault `VaultFolder/.obsidian/plugins/obsidian-note-autocreation/`.

## Development

### Preparing the dev environment
- Clone this repo
- Open the vault `tests/Note Auto Creation Test Vault` and disable safe mode to enable plugins
- Restart the server and enable the plugin Hot-Reload (See Manual Testing)
- Install NodeJS, then run `npm i` in the command line under your repo folder.
- Run `npm run dev` to compile this plugin from `src/main.ts` to `src/main.js`.
- Make changes to `main.ts` (or create new `.ts` files). Those changes should be automatically compiled into `main.js`.

### Testing the plugin

#### Manual testing
- Open the test vault `tests/Note Auto Creation Test Vault`
- Enable Note Auto Creator
- Enable the [Hot-Reload](https://github.com/pjeby/hot-reload) plugin in the vault. With this enabled our plugin is always reloaded when the Hot-Reload plugin observes changes to `main.js` or `styles.css`. 
- Run `npm run dev` to compile the plugin and automatically recompile when changes have been made.

#### Automated testing
No end-to-end tests have been implemented, but a number of unit tests have been implemented to test the core functionality. You can find the tests in the `tests` folder.

### Releasing new releases

- Update the `manifest.json` with the version number, such as `1.0.1`, and the minimum Obsidian version required for the latest release.
- Update the `versions.json` file with `"new-plugin-version": "minimum-obsidian-version"` so older versions of Obsidian can download an older version of your plugin that's compatible.
- Create a new GitHub release using the new version number as the "Tag version". Use the exact version number, don't include a prefix `v`. See here for an example: https://github.com/obsidianmd/obsidian-sample-plugin/releases
- Upload the files `manifest.json`, `main.js`, `styles.css` as binary attachments. Note: The manifest.json file must be in two places, first the root path of your repository and also in the release.
- Publish the release.

> You can simplify the version bump process by running `npm version patch`, `npm version minor` or `npm version major` after updating `minAppVersion` manually in `manifest.json`.
> The command will bump version in `manifest.json` and `package.json`, and add the entry for the new version to `versions.json`
