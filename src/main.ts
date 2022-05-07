import {
	App,
	Editor,
	EditorPosition,
	EditorSuggest,
	EditorSuggestContext, EditorSuggestTriggerInfo,
	Plugin,
	PluginSettingTab,
	Setting, TFile
} from 'obsidian';

import {IMetadataCollection, Suggestion, SuggestionCollector} from "./suggestionsCollection";

interface NoteAutoCreatorSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: NoteAutoCreatorSettings = {
	mySetting: 'default'
}

export default class NoteAutoCreator extends Plugin {
	settings: NoteAutoCreatorSettings;

	async onload() {
		await this.loadSettings();
		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));
		this.registerEditorSuggest( new LinkSuggestor( this.app ) );

	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class ObsidianMetadataCollection implements IMetadataCollection{
	private readonly app: App;
	constructor(app: App) {
		this.app = app;
	}

	getUnresolvedLinks(): Record<string, Record<string, number>> {
		return app.metadataCache.unresolvedLinks;

	}
}

class LinkSuggestor extends EditorSuggest<string>{
	private readonly suggestionsCollector: SuggestionCollector;

	constructor( app: App ) {
		super( app );
		const metadataCollection = new ObsidianMetadataCollection(app);
		this.suggestionsCollector = new SuggestionCollector(metadataCollection) ;
	}

	getSuggestions(context: EditorSuggestContext): string[] | Promise<string[]> {
		return this.suggestionsCollector.getSuggestions().map(s => s.VaultPath)
	}

	onTrigger(cursor: EditorPosition, editor: Editor, file: TFile): EditorSuggestTriggerInfo | null {
		if (cursor.ch === 0){
			// At beginning of line, nothing has been written
			return null;
		}

		const line = editor.getLine( cursor.line );
		const startOfSearch = line.lastIndexOf('@');
		const regex = new RegExp(/@(.*)/)
		const match = regex.exec(
			line.slice(startOfSearch, line.length)
		);

		if (!match){
			return null;
		}

		// Modify match to be relative to line
		match.index += startOfSearch;

		console.log('Found a match', match)

		const startMatch = match.length === 1 ? match.index : match.index + 1 // TO avoid issue where only @ has been added and it is the last character in the document

		return {
			start: { line: cursor.line, ch: startMatch },
			end: { line: cursor.line, ch: match.length  },
			query: match[1]
		};
	}

	renderSuggestion(value: string, el: HTMLElement): void {
		const suggestion = new Suggestion(value)
		el.setText( suggestion.Title );
	}

	selectSuggestion(value: string, evt: MouseEvent | KeyboardEvent): void {

	}

}

class SampleSettingTab extends PluginSettingTab {
	plugin: NoteAutoCreator;

	constructor(app: App, plugin: NoteAutoCreator) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Settings for the Note Auto Creator plugin'});

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					console.log('Secret: ' + value);
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
