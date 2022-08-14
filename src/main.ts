import {Plugin} from 'obsidian'
import {DEFAULT_SETTINGS, NoteAutoCreatorSettings} from "./settings/NoteAutoCreatorSettings"
import {SettingTab} from "./settings/SettingTab"
import {LinkSuggestorInterop} from "./interop/LinkSuggestorInterop"
import {ObsidianFolderPath} from "./core/paths/ObsidianFolderPath"

export default class NoteAutoCreator extends Plugin {
	settings: NoteAutoCreatorSettings

	async onload() {
		await this.loadSettings()

		this.addSettingTab(new SettingTab(this.app, this))

		const linkSuggestor = new LinkSuggestorInterop( this.app, this.settings )
		this.registerEditorSuggest( linkSuggestor )
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())

		// Recreating the relative top folders is necessary to make the paths are created as ObsidianFolderPath objects and not just anonymous objects.
		this.settings.relativeTopFolders = this.settings.relativeTopFolders.map(f => new ObsidianFolderPath(f.VaultPath))
	}

	async saveSettings() {
		await this.saveData(this.settings)
	}
}

