# Obsidian Note Auto Creator plugin

This plugin makes it possible to automatically create notes when links are created to them.

### Manually installing the plugin

- Copy over `main.js`, `styles.css`, `manifest.json` to your vault `VaultFolder/.obsidian/plugins/obsidian-note-autocreation/`.

## Development

### Preparing the dev environment
- Clone this repo
- Open the vault `tests/Note Auto Creation Test Vault` and disable safe modes to enable plugins
- Restart the server and enable the plugin Hot-Reload (See Manual Testing)
- Install NodeJS, then run `npm i` in the command line under your repo folder.
- Run `npm run dev` to compile this plugin from `src/main.ts` to `src/main.js`.
- Make changes to `main.ts` (or create new `.ts` files). Those changes should be automatically compiled into `main.js`.

### Testing the plugin

#### Manual testing
- Open the test vault `tests/Note Auto Creation Test Vault`
- Enable the [Hot-Reload](https://github.com/pjeby/hot-reload) plugin in the vault. With this enabled our plugin is always reloaded when the Hot-Reload plugin observed changes to `main.js` or `styles.css`. 
- Run `npm run dev` to compile the plugin and automatically recompile when changes have been made.
- You can now begin testing manually. Note Auto Creator is automatically enabled by the Hot-Reload plugin.

#### Automated testing


### Releasing new releases

- Update the `manifest.json` with the version number, such as `1.0.1`, and the minimum Obsidian version required for the latest release.
- Update the `versions.json` file with `"new-plugin-version": "minimum-obsidian-version"` so older versions of Obsidian can download an older version of your plugin that's compatible.
- Create a new GitHub release using the new version number as the "Tag version". Use the exact version number, don't include a prefix `v`. See here for an example: https://github.com/obsidianmd/obsidian-sample-plugin/releases
- Upload the files `manifest.json`, `main.js`, `styles.css` as binary attachments. Note: The manifest.json file must be in two places, first the root path of your repository and also in the release.
- Publish the release.

> You can simplify the version bump process by running `npm version patch`, `npm version minor` or `npm version major` after updating `minAppVersion` manually in `manifest.json`.
> The command will bump version in `manifest.json` and `package.json`, and add the entry for the new version to `versions.json`
