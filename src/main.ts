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
	useWikiLinks: boolean
}

const DEFAULT_SETTINGS: NoteAutoCreatorSettings = {
	useWikiLinks: true
}

export default class NoteAutoCreator extends Plugin {
	settings: NoteAutoCreatorSettings;

	async onload() {
		await this.loadSettings();
		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));
		this.registerEditorSuggest( new LinkSuggestor( this.app, this.settings ) );

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
	private settings: NoteAutoCreatorSettings;

	constructor( app: App, settings: NoteAutoCreatorSettings ) {
		super( app );
		const metadataCollection = new ObsidianMetadataCollection(app);
		this.suggestionsCollector = new SuggestionCollector(metadataCollection);
		this.settings = settings;
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

	selectSuggestion(value: string, evt: MouseEvent | KeyboardEvent) {
		this.doTheThing(value).then(() => console.log('Done with the suggestion')).catch(err => console.error(err));
	}

	private async doTheThing(value: string) {
		console.log('entering do the thing')
		const editor = this.context.editor;
		const suggestion = new Suggestion(value)
		const startPosition = {line: this.currentTrigger.start.line, ch: this.currentTrigger.start.ch - 1};

		if (suggestion.Title === "") {
			return
		}

		// Create folder if necessary
		if (suggestion.FolderPath && !app.vault.getAbstractFileByPath(suggestion.FolderPath)) {
			console.log('Creating folder', suggestion.FolderPath)
			await app.vault.createFolder(suggestion.FolderPath)
			console.log('Folder created')
		}


		const pathToActiveFile = app.workspace.getActiveFile().path;
		console.log('Path to active file is', pathToActiveFile)
		let file = app.metadataCache.getFirstLinkpathDest(suggestion.VaultPath, pathToActiveFile)

		console.log('File is', file)

		let newFilePath = getLinkpath(suggestion.VaultPath);
		if (!file) {
			if (!newFilePath.endsWith('.md')) {
				newFilePath = `${newFilePath}.md`
			}
			file = await this.createFile(newFilePath, `# ${suggestion.Title}`)
		}

		console.log('Done with file creation')

		const useWikiLinks = this.settings.useWikiLinks
		const pathToFile = app.metadataCache.fileToLinktext(file, pathToActiveFile, useWikiLinks)

		console.log('Path to file is', pathToFile)

		let valueToInsert = useWikiLinks
			? `[[${pathToFile}|${suggestion.Title}]]`
			: `[${suggestion.Title}](${encodeURI(pathToFile)})`;

		console.log('Inserting value', valueToInsert)


		editor.replaceRange(valueToInsert, startPosition, this.currentTrigger.end);
	}

	async createFolder(folderPath: string){
		await app.vault.createFolder(folderPath)
	}

	async createFile(filePath: string, fileContent: string): Promise<TFile> {
		const file = await app.vault.create(filePath, `# ${fileContent}`);
		return file;
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
			.setName('Use [[Wikilinks]]')
			.setDesc('Generate Wikilinks when creating new links. Disable this option to generate Markdown links instead')
			.addToggle(component => component
				.setValue(this.plugin.settings.useWikiLinks)
				.onChange(async (value) => {
					this.plugin.settings.useWikiLinks = value;
					await this.plugin.saveSettings();
				}));
	}
}
