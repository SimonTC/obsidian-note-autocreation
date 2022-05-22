import {
	App,
	Editor,
	EditorPosition,
	EditorSuggest,
	EditorSuggestContext,
	EditorSuggestTriggerInfo,
	TFile
} from "obsidian"
import {ObsidianInterop} from "./ObsidianInterop"
import {NoteAutoCreatorSettings} from "../settings/NoteAutoCreatorSettings"
import {LinkSuggestor} from "../core/LinkSuggestor"
import {Suggestion} from "../core/Suggestion"

/**
 * Wrapper around the Link suggestor logic.
 * Enables testing of the core logic since no obsidian specific types needs to be used in LinkSuggestor.
 */
export class LinkSuggestorInterop extends EditorSuggest<Suggestion> {
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

	getSuggestions(context: EditorSuggestContext): Suggestion[] | Promise<Suggestion[]> {
		return this.wrapped.getSuggestions(context)
	}

	onTrigger(cursor: EditorPosition, editor: Editor, file: TFile): EditorSuggestTriggerInfo | null {
		return this.wrapped.onTrigger(cursor, editor, file)
	}

	renderSuggestion(value: Suggestion, el: HTMLElement): void {
		this.wrapped.renderSuggestion(value, el)
	}

	selectSuggestion(value: Suggestion, evt: MouseEvent | KeyboardEvent) {
		this.wrapped.selectSuggestion(value, evt, this.context)
	}
}
