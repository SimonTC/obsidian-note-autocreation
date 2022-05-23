import {Suggestion} from "./Suggestion"
import {NoteSuggestion} from "./NoteSuggestion"

export class TemplateSuggestion extends Suggestion{
	readonly noteSuggestion: NoteSuggestion

	constructor(templatePath: string, noteSuggestion: NoteSuggestion) {
		super(templatePath)
		this.noteSuggestion = noteSuggestion
	}
}
