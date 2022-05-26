import {LinkCreationPreparer, NoteCreationCommand} from "./LinkCreationPreparer"
import {NoteAutoCreatorSettings} from "../settings/NoteAutoCreatorSettings"
import {DocumentLocation, extractSuggestionTrigger, SuggestionTrigger} from "./suggestionExtraction"
import {NoteSuggestion} from "./suggestions/NoteSuggestion"
import {IEditor, IEditorSuggestContext, IObsidianInterop} from "../interop/ObsidianInterfaces"
import {Notice, TFile} from "obsidian"
import {Suggestion} from "./suggestions/Suggestion"
import {TemplateSuggestion} from "./suggestions/TemplateSuggestion"
import {SuggestionCollector} from "./suggestionCollection/SuggestionCollector"

export class LinkSuggestor {
	private readonly suggestionsCollector: SuggestionCollector
	private readonly noteCreationPreparer: LinkCreationPreparer
	private readonly obsidianInterop: IObsidianInterop
	private readonly settings: NoteAutoCreatorSettings
	private currentTrigger: SuggestionTrigger

	constructor(interop: IObsidianInterop, settings: NoteAutoCreatorSettings) {
		this.obsidianInterop = interop
		this.suggestionsCollector = new SuggestionCollector(this.obsidianInterop, settings)
		this.noteCreationPreparer = new LinkCreationPreparer(this.obsidianInterop, this.obsidianInterop)
		this.settings = settings
	}

	instructions = [
		{command: 'Type |', purpose: 'to change display text'},
	]

	getSuggestions(context: IEditorSuggestContext): Suggestion[] | Promise<Suggestion[]> {
		return this.suggestionsCollector.getSuggestions(context.query)
	}

	onTrigger(cursor: DocumentLocation, editor: IEditor, file: TFile): SuggestionTrigger | null {
		const line = editor.getLine(cursor.line)
		this.currentTrigger = extractSuggestionTrigger(line, cursor, this.settings.triggerSymbol)
		return this.currentTrigger
	}

	renderSuggestion(value: Suggestion, el: HTMLElement): void {
		value.render(el)
	}

	selectSuggestion(value: Suggestion, evt: MouseEvent | KeyboardEvent, context: IEditorSuggestContext) {
		const currentFile = context.file
		this.selectSuggestionAsync(value, currentFile, context)
	}

	private async selectSuggestionAsync(suggestion: Suggestion, currentFile: TFile, context: IEditorSuggestContext) {
		if (suggestion.Title === "") {
			return
		}

		if (suggestion instanceof NoteSuggestion){
			await this.selectNoteSuggestion(suggestion, currentFile, context)
		} else if (suggestion instanceof TemplateSuggestion){
			await this.selectTemplateSuggestion(suggestion, currentFile, context)
		}
	}

	private async selectTemplateSuggestion(templateSuggestion: TemplateSuggestion, currentFile: TFile, context: IEditorSuggestContext) {
		if (!this.obsidianInterop.noteExists(templateSuggestion.VaultPath)){
			new Notice(`Cannot execute a non-existing template "${templateSuggestion.VaultPath}". Note was not created`)
			return
		}

		const creationCommand = await this.noteCreationPreparer.prepareNoteCreationForTemplateNote(templateSuggestion, currentFile)
		const linkedFile = await this.obsidianInterop.getOrCreateFileAndFoldersInPath(creationCommand, currentFile)
		if (creationCommand.NoteCreationCommand && linkedFile){
			await this.obsidianInterop.runTemplaterOn(linkedFile)
		}
		const linkToInsert = this.obsidianInterop.generateMarkdownLink(linkedFile, currentFile.path, undefined, creationCommand.NoteAlias)
		this.replaceSuggestionWithLink(linkToInsert, context)
	}

	private async selectNoteSuggestion(suggestion: NoteSuggestion, currentFile: TFile, context: IEditorSuggestContext) {
		const creationCommand = await this.noteCreationPreparer.prepareNoteCreationForEmptyNote(suggestion, currentFile)
		const linkedFile = await this.obsidianInterop.getOrCreateFileAndFoldersInPath(creationCommand, currentFile)
		const linkToInsert = this.obsidianInterop.generateMarkdownLink(linkedFile, currentFile.path, undefined, creationCommand.NoteAlias)
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
		const textToInsert = newSuggestion.textToInsertOnLineUpdate
		const finalCursorPosition = {
			line: this.currentTrigger.start.line,
			ch: this.currentTrigger.start.ch + textToInsert.length
		}
		editor.replaceRange(textToInsert, this.currentTrigger.start, this.currentTrigger.end)
		editor.setCursor(finalCursorPosition)
	}
}
