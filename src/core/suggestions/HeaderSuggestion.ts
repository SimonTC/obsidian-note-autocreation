import {ISuggestion} from "./ISuggestion"

export class HeaderSuggestion implements ISuggestion{
	private readonly level: number
	private readonly header: string

	constructor(header: string, level: number) {
		this.header = header
		this.level = level
	}

	get Title(): string {
		return this.header
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
		return this.header
	}
}
