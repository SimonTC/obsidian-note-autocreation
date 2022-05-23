import {Suggestion} from "./Suggestion"
import {NoteSuggestion} from "./NoteSuggestion"

export class TemplateSuggestion extends Suggestion{
	readonly noteSuggestion: NoteSuggestion

	constructor(templatePath: string, noteSuggestion: NoteSuggestion) {
		super(templatePath)
		this.noteSuggestion = noteSuggestion
	}

	render(el: HTMLElement): void {
		el.createDiv({
			cls: "suggestion-content",
			text: this.Title
		})
		el.createDiv({
			cls: "suggestion-note",
			text: `Apply template to ${this.noteSuggestion.VaultPath}`
		})
	}
}
