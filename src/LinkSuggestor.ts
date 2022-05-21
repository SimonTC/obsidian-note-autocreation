import {
	App,
	Editor,
	EditorPosition,
	EditorSuggest,
	EditorSuggestContext,
	EditorSuggestTriggerInfo,
	TFile
} from "obsidian"
import {SuggestionCollector} from "./core/SuggestionCollector"
import {NoteCreationPreparer} from "./core/NoteCreationPreparer"
import {ObsidianInterop} from "./interop/ObsidianInterop"
import {NoteAutoCreatorSettings} from "./settings/NoteAutoCreatorSettings"
import {extractSuggestionTrigger} from "./core/suggestionExtraction"
import {Suggestion} from "./core/Suggestion"

export class LinkSuggestor extends EditorSuggest<string> {
	private readonly suggestionsCollector: SuggestionCollector
	private readonly noteCreationPreparer: NoteCreationPreparer
	private readonly obsidianInterop: ObsidianInterop
	private currentTrigger: EditorSuggestTriggerInfo
	private settings: NoteAutoCreatorSettings

	constructor(app: App, settings: NoteAutoCreatorSettings) {
		super(app)
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
		const line = editor.getLine(cursor.line)
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
		const startPosition = {
			line: this.currentTrigger.start.line,
			ch: this.currentTrigger.start.ch - this.settings.triggerSymbol.length
		}
		editor.replaceRange(valueToInsert, startPosition, this.currentTrigger.end)
	}

	updateSuggestionLine(text: string) {
		const editor = this.context.editor
		const newSuggestion = new Suggestion(text)
		const textToInsert = newSuggestion.VaultPathWithoutExtension
		const finalCursorPosition = {
			line: this.currentTrigger.start.line,
			ch: this.currentTrigger.start.ch + textToInsert.length
		}
		editor.replaceRange(textToInsert, this.currentTrigger.start, this.currentTrigger.end)
		editor.setCursor(finalCursorPosition)
	}
}
