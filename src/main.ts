import {
	App,
	Editor,
	EditorPosition,
	EditorSuggest,
	EditorSuggestContext, EditorSuggestTriggerInfo, getLinkpath,
	Plugin,
	PluginSettingTab,
	Setting, TFile, TFolder
} from 'obsidian';

import {Suggestion} from "./Suggestion";
import {SuggestionCollector} from "./SuggestionCollector";
import {IFileSystem, IMetadataCollection} from "./ObsidianInterfaces";
import {extractSuggestionTrigger} from "./suggestionExtraction";
import {NoteCreationPreparer} from "./NoteCreationPreparer";

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

class ObsidianInterop implements IMetadataCollection, IFileSystem{
	private readonly app: App;
	constructor(app: App) {
		this.app = app;
	}

	getUnresolvedLinks(): Record<string, Record<string, number>> {
		return app.metadataCache.unresolvedLinks;

	}

	folderExists(folderPath: string): boolean {
		const foundItem = app.vault.getAbstractFileByPath(folderPath)
		return foundItem && foundItem instanceof TFolder
	}

	noteExists(notePath: string): boolean {
		const foundItem = app.vault.getAbstractFileByPath(notePath)
		return foundItem && foundItem instanceof TFile
	}
}

class LinkSuggestor extends EditorSuggest<string>{
	private readonly suggestionsCollector: SuggestionCollector;
	private readonly noteCreationPreparer: NoteCreationPreparer
	private currentTrigger: EditorSuggestTriggerInfo;
	private settings: NoteAutoCreatorSettings;

	constructor( app: App, settings: NoteAutoCreatorSettings ) {
		super( app );
		const metadataCollection = new ObsidianInterop(app);
		this.suggestionsCollector = new SuggestionCollector(metadataCollection);
		this.noteCreationPreparer = new NoteCreationPreparer(metadataCollection)
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
		const suggestion = new Suggestion(value)

		if (suggestion.Title === "") {
			return
		}

		const editor = this.context.editor;
		const startPosition = {line: this.currentTrigger.start.line, ch: this.currentTrigger.start.ch - 1};

		const creationCommand = this.noteCreationPreparer.prepareNoteCreationFor(suggestion);
		if (creationCommand.FolderCreationNeeded){
			await app.vault.createFolder(creationCommand.PathToNewFolder)
		}

		const file = creationCommand.FileCreationNeeded
			? await app.vault.create(creationCommand.PathToNewFile, creationCommand.NoteContent)
			: app.vault.getAbstractFileByPath(suggestion.VaultPath) as TFile

		const pathToActiveFile = app.workspace.getActiveFile().path;
		const useWikiLinks = this.settings.useWikiLinks
		const pathToFile = app.metadataCache.fileToLinktext(file, pathToActiveFile, useWikiLinks)
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
