import {ISuggestion} from "./ISuggestion"

export class HeaderSuggestion implements ISuggestion{
	get Title(): string {
		return ""
	}

	render(el: HTMLElement): void {
	}

	get textToInsertOnLineUpdate(): string {
		return ""
	}
}
