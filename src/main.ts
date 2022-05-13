import {
	App,
	Editor,
	EditorPosition,
	EditorSuggest,
	EditorSuggestContext,
	EditorSuggestTriggerInfo,
	Plugin,
	PluginSettingTab,
	Setting,
	TFile
} from 'obsidian';

import {Suggestion} from "./Suggestion";
import {SuggestionCollector} from "./SuggestionCollector";
import {extractSuggestionTrigger} from "./suggestionExtraction";
import {NoteCreationPreparer} from "./NoteCreationPreparer";
import {ObsidianInterop} from "./ObsidianInterop";

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

class LinkSuggestor extends EditorSuggest<string>{
	private readonly suggestionsCollector: SuggestionCollector;
	private readonly noteCreationPreparer: NoteCreationPreparer
	private readonly obsidianInterop: ObsidianInterop;
	private currentTrigger: EditorSuggestTriggerInfo;
	private settings: NoteAutoCreatorSettings;

	constructor( app: App, settings: NoteAutoCreatorSettings ) {
		super( app );
		this.obsidianInterop = new ObsidianInterop(app);
		this.suggestionsCollector = new SuggestionCollector(this.obsidianInterop);
		this.noteCreationPreparer = new NoteCreationPreparer(this.obsidianInterop)
		this.settings = settings;

		const instructions = [
			{command: 'Type #', purpose: 'to link heading'},
			{command: 'Type |', purpose: 'to change display text'},
		]
		this.setInstructions(instructions)
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
		const currentFile = this.context.file
		this.selectSuggestionAsync(value, currentFile)
	}

	private async selectSuggestionAsync(suggestionString: string, currentFile: TFile) {
		const suggestion = new Suggestion(suggestionString)

		if (suggestion.Title === "") {
			return
		}

		const creationCommand = this.noteCreationPreparer.prepareNoteCreationFor(suggestion);
		const linkedFile = await this.obsidianInterop.getOrCreateFileAndFoldersInPath(creationCommand, suggestion);
		let linkToInsert = app.fileManager.generateMarkdownLink(linkedFile, currentFile.path, undefined, suggestion.Alias);
		this.replaceSuggestionWithLink(linkToInsert);
	}

	private replaceSuggestionWithLink(valueToInsert: string) {
		const editor = this.context.editor;
		const startPosition = {line: this.currentTrigger.start.line, ch: this.currentTrigger.start.ch - 1};
		editor.replaceRange(valueToInsert, startPosition, this.currentTrigger.end);
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
