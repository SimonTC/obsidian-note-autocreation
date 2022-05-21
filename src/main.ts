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
	TextComponent,
	TFile
} from 'obsidian'

import {Suggestion} from "./Suggestion"
import {SuggestionCollector} from "./SuggestionCollector"
import {extractSuggestionTrigger} from "./suggestionExtraction"
import {NoteCreationPreparer} from "./NoteCreationPreparer"
import {ObsidianInterop} from "./ObsidianInterop"
import {DEFAULT_SETTINGS, NoteAutoCreatorSettings} from "./NoteAutoCreatorSettings"

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

class LinkSuggestor extends EditorSuggest<string>{
	private readonly suggestionsCollector: SuggestionCollector
	private readonly noteCreationPreparer: NoteCreationPreparer
	private readonly obsidianInterop: ObsidianInterop
	private currentTrigger: EditorSuggestTriggerInfo
	private settings: NoteAutoCreatorSettings

	constructor( app: App, settings: NoteAutoCreatorSettings ) {
		super( app )
		this.obsidianInterop = new ObsidianInterop(app)
		this.suggestionsCollector = new SuggestionCollector(this.obsidianInterop)
		this.noteCreationPreparer = new NoteCreationPreparer(this.obsidianInterop)
		this.settings = settings

		const instructions = [
			{command: 'Type |', purpose: 'to change display text'},
		]
		this.setInstructions(instructions)

		// @ts-ignore
		this.scope.register([], 'Tab', (event) => {
			// @ts-ignore
			// Undocumented field
			const suggestionCollection = this.suggestions
			const idOfHighlightedSuggestion = suggestionCollection.selectedItem
			const highlightedSuggestion = suggestionCollection.values[idOfHighlightedSuggestion]
			this.updateSuggestionLine(highlightedSuggestion)
		})
	}

	getSuggestions(context: EditorSuggestContext): string[] | Promise<string[]> {
		return this.suggestionsCollector.getSuggestions(context.query).map(s => s.Trigger)
	}

	onTrigger(cursor: EditorPosition, editor: Editor, file: TFile): EditorSuggestTriggerInfo | null {
		const line = editor.getLine( cursor.line )
		this.currentTrigger = extractSuggestionTrigger(line, {...cursor}, this.settings.triggerSymbol)
		return this.currentTrigger
	}

	renderSuggestion(value: string, el: HTMLElement): void {
		const suggestion = new Suggestion(value)

		const triggerDiv = el.createDiv({
			cls: "nac-suggestion-trigger",
			text: suggestion.Trigger,
		})
		triggerDiv.hidden = true

		el.createDiv({
			cls: "suggestion-content",
			text: suggestion.Title
		})
		el.createDiv({
			cls: "suggestion-note",
			text: suggestion.FolderPath + '/'
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

		const creationCommand = this.noteCreationPreparer.prepareNoteCreationFor(suggestion)
		const linkedFile = await this.obsidianInterop.getOrCreateFileAndFoldersInPath(creationCommand, suggestion, currentFile)
		const linkToInsert = app.fileManager.generateMarkdownLink(linkedFile, currentFile.path, undefined, creationCommand.Alias)
		this.replaceSuggestionWithLink(linkToInsert)
		this.currentTrigger = undefined
	}

	private replaceSuggestionWithLink(valueToInsert: string) {
		const editor = this.context.editor
		const startPosition = {line: this.currentTrigger.start.line, ch: this.currentTrigger.start.ch - this.settings.triggerSymbol.length}
		editor.replaceRange(valueToInsert, startPosition, this.currentTrigger.end)
	}

	updateSuggestionLine(text: string) {
		const editor = this.context.editor
		const newSuggestion = new Suggestion(text)
		const textToInsert = newSuggestion.VaultPathWithoutExtension
		const finalCursorPosition = {line: this.currentTrigger.start.line, ch: this.currentTrigger.start.ch + textToInsert.length}
		editor.replaceRange(textToInsert, this.currentTrigger.start, this.currentTrigger.end)
		editor.setCursor(finalCursorPosition)
	}
}

class SettingTab extends PluginSettingTab {
	plugin: NoteAutoCreator

	// Problematic symbols are based on this table from the markdown guide:
	// https://www.markdownguide.org/basic-syntax/#characters-you-can-escape
	private readonly problematicSymbols = ["\\", "`", "*", "_", "{", "}", "[", "]", "<", ">", "(", ")", "#", "+", "-", ".", "!", "|"]

	constructor(app: App, plugin: NoteAutoCreator) {
		super(app, plugin)
		this.plugin = plugin
	}

	display(): void {
		const {containerEl} = this
		containerEl.empty()

		const trigger = new Setting(containerEl)
			.setName('Trigger for link insertion')
			.setDesc('The text string that will trigger link selection.')
			.setTooltip(
				'The string can contain multiple symbols such as @@ ' +
				'Avoid using characters / strings you often use while writing or that might be used by Obsidian or by other plugins to trigger actions. ' +
				'Some examples of strings to avoid: "[", "|", "#"')
		trigger.addText(component => component
			.setValue(this.plugin.settings.triggerSymbol)
			.onChange(async (value) => {
				this.removeValidationWarning(component, trigger)
				this.warnIfTriggerIsProblematic(value, trigger, component)
				this.plugin.settings.triggerSymbol = value
				await this.plugin.saveSettings()
			}))
	}

	private warnIfTriggerIsProblematic(value: string, trigger: Setting, component: TextComponent) {
		const triggerStartsWithProblematicCharacter = this.problematicSymbols.some(problem => value.startsWith(problem))
		const triggerIsEmptyOrOnlyWhitespace = value.trim().length === 0
		const triggerIsProblematic = triggerStartsWithProblematicCharacter || triggerIsEmptyOrOnlyWhitespace
		if (triggerIsProblematic) {
			trigger.controlEl.addClass('setting-warning')
			component.inputEl.setCustomValidity(`Using '${value}' as the trigger for inserting links might not work as intended`)
			component.inputEl.reportValidity()
		}
	}

	private removeValidationWarning(component: TextComponent, trigger: Setting) {
		component.inputEl.setCustomValidity('')
		component.inputEl.reportValidity()
		trigger.controlEl.removeClass('setting-warning')
	}
}
