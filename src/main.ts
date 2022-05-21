import {Plugin} from 'obsidian'
import {DEFAULT_SETTINGS, NoteAutoCreatorSettings} from "./NoteAutoCreatorSettings"
import {LinkSuggestor} from "./LinkSuggestor"
import {SettingTab} from "./SettingTab"

export default class NoteAutoCreator extends Plugin {
	settings: NoteAutoCreatorSettings

	async onload() {
		await this.loadSettings()

		this.addSettingTab(new SettingTab(this.app, this))

		const linkSuggestor = new LinkSuggestor( this.app, this.settings )
		this.registerEditorSuggest( linkSuggestor )
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
	}

	async saveSettings() {
		await this.saveData(this.settings)
	}
}

