import {
	App,
	Editor,
	EditorPosition,
	EditorSuggest,
	EditorSuggestContext,
	EditorSuggestTriggerInfo, Notice,
	TFile
} from "obsidian"
import {ObsidianInterop} from "./ObsidianInterop"
import {NoteAutoCreatorSettings} from "../settings/NoteAutoCreatorSettings"
import {LinkSuggestor} from "../core/LinkSuggestor"
import {FileSuggestion} from "../core/suggestions/FileSuggestion"
import {TemplateSuggestion} from "../core/suggestions/TemplateSuggestion"
import {ExistingNoteSuggestion} from "../core/suggestions/NoteSuggestion"

/**
 * Wrapper around the Link suggestor logic.
 * Enables testing of the core logic since no obsidian specific types needs to be used in LinkSuggestor.
 */
export class LinkSuggestorInterop extends EditorSuggest<FileSuggestion> {
	private wrapped: LinkSuggestor

	constructor(app: App, settings: NoteAutoCreatorSettings) {
		super(app)
		this.wrapped = new LinkSuggestor(new ObsidianInterop(app), settings)
		this.setInstructions(this.wrapped.instructions)

		// @ts-ignore
		this.scope.register([], 'Tab', (event) => {
			// @ts-ignore
			// Undocumented field
			const suggestionCollection = this.suggestions
			const idOfHighlightedSuggestion = suggestionCollection.selectedItem
			const highlightedSuggestion = suggestionCollection.values[idOfHighlightedSuggestion]
			this.wrapped.updateSuggestionLine(highlightedSuggestion, this.context)
		})
	}

	getSuggestions(context: EditorSuggestContext): FileSuggestion[] | Promise<FileSuggestion[]> {
		return this.wrapped.getSuggestions(context)
	}

	onTrigger(cursor: EditorPosition, editor: Editor, file: TFile): EditorSuggestTriggerInfo | null {
		return this.wrapped.onTrigger(cursor, editor, file)
	}

	renderSuggestion(value: FileSuggestion, el: HTMLElement): void {
		this.wrapped.renderSuggestion(value, el)
	}

	selectSuggestion(value: FileSuggestion, evt: MouseEvent | KeyboardEvent) {
		if (value instanceof TemplateSuggestion && value.noteSuggestion instanceof ExistingNoteSuggestion){
			new Notice('Executing templates on existing notes is not supported')
			return
		}
		this.wrapped.selectSuggestion(value, evt, this.context)
	}
}
