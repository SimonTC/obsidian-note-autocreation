import {ISuggestion} from "./ISuggestion"
import {SuggestionRenderer} from "./SuggestionRenderer"

/**
 * Suggestion returned when nothing is found with the query.
 */
export class NotFoundSuggestion implements ISuggestion{
	private readonly trigger: string
	private readonly message: string

	constructor(trigger: string, messageToShow: string) {
		this.trigger = trigger
		this.message = messageToShow
	}

	get Title(): string {
		return this.message
	}

	render(el: HTMLElement): void {
		SuggestionRenderer.RenderSuggestion(el, {
			content: this.Title,
			note: "",
		})
	}

	get textToInsertOnLineUpdate(): string {
		return this.trigger
	}

}
