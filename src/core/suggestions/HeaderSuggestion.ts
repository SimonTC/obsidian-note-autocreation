import {ISuggestion} from "./ISuggestion"
import {ExistingNoteSuggestion} from "./NoteSuggestion"

export class HeaderSuggestion implements ISuggestion{
	private readonly level: number
	private readonly header: string
	private readonly noteSuggestion: ExistingNoteSuggestion
	private readonly alias: string | undefined

	constructor(header: string, level: number, alias: string | undefined, noteSuggestion: ExistingNoteSuggestion) {
		this.header = header
		this.level = level
		this.noteSuggestion = noteSuggestion
		this.alias = alias
	}

	get ParentNote(): ExistingNoteSuggestion{
		return this.noteSuggestion
	}

	get Alias(): string | undefined{
		return this.alias
	}

	get Title(): string {
		return this.header
	}

	get AsSubPath() : string{
		return `#${this.Title}`
	}

	render(el: HTMLElement): void {
		const content = el.createDiv({
			cls: "suggestion-content",
			text: this.Title
		})

		content.createSpan({
			cls: "suggestion-flair",
			text: `H${this.level}`
		})
	}

	get textToInsertOnLineUpdate(): string {
		return `${this.noteSuggestion.Trigger}#${this.Title}`
	}
}
