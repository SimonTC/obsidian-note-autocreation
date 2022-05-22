import {SuggestionCollector} from "./SuggestionCollector"
import {LinkCreationPreparer} from "./LinkCreationPreparer"
import {NoteAutoCreatorSettings} from "../settings/NoteAutoCreatorSettings"
import {DocumentLocation, extractSuggestionTrigger, SuggestionTrigger} from "./suggestionExtraction"
import {Suggestion} from "./Suggestion"
import {IEditor, IEditorSuggestContext, IFile, IObsidianInterop} from "../interop/ObsidianInterfaces"

export class LinkSuggestor {
	private readonly suggestionsCollector: SuggestionCollector
	private readonly noteCreationPreparer: LinkCreationPreparer
	private readonly obsidianInterop: IObsidianInterop
	private settings: NoteAutoCreatorSettings
	private currentTrigger: SuggestionTrigger

	constructor(interop: IObsidianInterop, settings: NoteAutoCreatorSettings) {
		this.obsidianInterop = interop
		this.suggestionsCollector = new SuggestionCollector(this.obsidianInterop)
		this.noteCreationPreparer = new LinkCreationPreparer(this.obsidianInterop, this.obsidianInterop)
		this.settings = settings
	}

	instructions = [
		{command: 'Type |', purpose: 'to change display text'},
	]

	getSuggestions(context: IEditorSuggestContext): Suggestion[] | Promise<Suggestion[]> {
		return this.suggestionsCollector.getSuggestions(context.query)
	}

	onTrigger(cursor: DocumentLocation, editor: IEditor, file: IFile): SuggestionTrigger | null {
		const line = editor.getLine(cursor.line)
		this.currentTrigger = extractSuggestionTrigger(line, cursor, this.settings.triggerSymbol)
		return this.currentTrigger
	}

	renderSuggestion(value: Suggestion, el: HTMLElement): void {
		el.createDiv({
			cls: "suggestion-content",
			text: value.Title
		})
		el.createDiv({
			cls: "suggestion-note",
			text: value.FolderPath + '/'
		})
	}

	selectSuggestion(value: Suggestion, evt: MouseEvent | KeyboardEvent, context: IEditorSuggestContext) {
		const currentFile = context.file
		this.selectSuggestionAsync(value, currentFile, context)
	}

	private async selectSuggestionAsync(suggestion: Suggestion, currentFile: IFile, context: IEditorSuggestContext) {
		if (suggestion.Title === "") {
			return
		}

		const creationCommand = this.noteCreationPreparer.prepareNoteCreationFor(suggestion, currentFile)
		const linkedFile = await this.obsidianInterop.getOrCreateFileAndFoldersInPath(creationCommand, currentFile)
		const linkToInsert = app.fileManager.generateMarkdownLink(linkedFile, currentFile.path, undefined, creationCommand.NoteAlias)
		this.replaceSuggestionWithLink(linkToInsert, context)
	}

	private replaceSuggestionWithLink(valueToInsert: string, context: IEditorSuggestContext) {
		const editor = context.editor
		const startPosition = {
			line: this.currentTrigger.start.line,
			ch: this.currentTrigger.start.ch - this.settings.triggerSymbol.length
		}
		editor.replaceRange(valueToInsert, startPosition, this.currentTrigger.end)
	}

	updateSuggestionLine(newSuggestion: Suggestion, context: IEditorSuggestContext) {
		const editor = context.editor
		const textToInsert = newSuggestion.VaultPathWithoutExtension
		const finalCursorPosition = {
			line: this.currentTrigger.start.line,
			ch: this.currentTrigger.start.ch + textToInsert.length
		}
		editor.replaceRange(textToInsert, this.currentTrigger.start, this.currentTrigger.end)
		editor.setCursor(finalCursorPosition)
	}
}
