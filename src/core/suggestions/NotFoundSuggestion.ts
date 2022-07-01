import {ISuggestion} from "./ISuggestion"

/**
 * Suggestion returned when nothing is found with the query.
 */
export class NotFoundSuggestion implements ISuggestion{
	private readonly trigger: string

	constructor(trigger: string) {
		this.trigger = trigger
	}

	get Title(): string {
		return 'No match found'
	}

	render(el: HTMLElement): void {
		el.createDiv({
			cls: "suggestion-content",
			text: this.Title
		})
	}

	get textToInsertOnLineUpdate(): string {
		return this.trigger
	}

}
