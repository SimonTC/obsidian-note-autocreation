import {
	App,
	Editor,
	EditorPosition,
	EditorSuggest,
	EditorSuggestContext, EditorSuggestTriggerInfo, getLinkpath,
	Plugin,
	PluginSettingTab,
	Setting, TFile
} from 'obsidian';

import {
	IMetadataCollection,
	Suggestion,
	SuggestionCollector,
	extractSuggestionTrigger,
	SuggestionTrigger
} from "./suggestionsCollection";

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
	private currentTrigger: EditorSuggestTriggerInfo;

	constructor( app: App ) {
		super( app );
		const metadataCollection = new ObsidianMetadataCollection(app);
		this.suggestionsCollector = new SuggestionCollector(metadataCollection) ;
	}

	getSuggestions(context: EditorSuggestContext): string[] | Promise<string[]> {
		return this.suggestionsCollector.getSuggestions(context.query).map(s => s.VaultPath)
	}

	onTrigger(cursor: EditorPosition, editor: Editor, file: TFile): EditorSuggestTriggerInfo | null {
		const line = editor.getLine( cursor.line );
		this.currentTrigger = extractSuggestionTrigger(line, {...cursor});
		return this.currentTrigger
	}

	renderSuggestion(value: string, el: HTMLElement): void {
		const suggestion = new Suggestion(value)
		el.createDiv({
			cls: "suggestion-content",
			text: suggestion.Title
		});
		el.createDiv({
			cls: "suggestion-note",
			text: suggestion.FolderPath
		})
	}

	selectSuggestion(value: string, evt: MouseEvent | KeyboardEvent): void {
		const editor = this.context.editor;
		const suggestion = new Suggestion(value)
		const startPosition = {line: this.currentTrigger.start.line, ch: this.currentTrigger.start.ch - 1};

		if(suggestion.Title === ""){
			return
		}

		// Create folder if necessary
		if(!app.vault.getAbstractFileByPath(suggestion.FolderPath)){
			app.vault.createFolder(suggestion.FolderPath)
		}

		let newFilePath = getLinkpath(suggestion.VaultPath);

		const pathToActiveFile = app.workspace.getActiveFile().path;
		let file = app.metadataCache.getFirstLinkpathDest(suggestion.VaultPath, pathToActiveFile)

		if(!file){
			if (!newFilePath.endsWith('.md')){
				newFilePath = `${newFilePath}.md`
			}
			app.vault.create(newFilePath, `# ${suggestion.Title}`).then(f => file = f);
		}

		const useWikiLinks = true
		const pathToFile = app.metadataCache.fileToLinktext(file, pathToActiveFile, !useWikiLinks)

		let valueToInsert = useWikiLinks
			? `[${suggestion.Title}](${encodeURI(pathToFile)})`
			: `[[${pathToFile}|${suggestion.Title}]]`;


		editor.replaceRange( valueToInsert, startPosition, this.currentTrigger.end );
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
