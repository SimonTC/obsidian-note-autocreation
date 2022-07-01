import {FileSuggestion} from "./FileSuggestion"

/**
 * A suggestion for a new or existing note.
 */
export abstract class NoteSuggestion extends FileSuggestion{
    /**
	 * The alias of the suggestion. This is the name that is shown in the document where the link is inserted.
	 */
	Alias: string | undefined

	/**
	 * Returns true if the suggestion contains an alias.
	 */
	get HasAlias() {return this.Alias && this.Alias.length > 0}

	constructor(trigger: string) {
		super(trigger)
		const fullPath = trigger.trim()
		const {alias} = this.extractSuggestionParts(fullPath)
		this.Alias = alias
	}

	private extractSuggestionParts(trigger: string): {alias: string} {
		if (trigger.indexOf('|') === -1){
			return {alias: undefined}
		}

		let alias = trigger.split('|').pop()
		alias = alias?.length === 0 ? undefined : alias?.trim()
		return {alias}
	}

	get textToInsertOnLineUpdate(): string {
		return this.VaultPathWithoutExtension
	}
}

/**
 * Suggestion for a note that already exists
 */
export class ExistingNoteSuggestion extends NoteSuggestion{
	render(el: HTMLElement): void {
		el.createDiv({
			cls: "suggestion-content",
			text: this.Title
		})
		el.createDiv({
			cls: "suggestion-note",
			text: this.FolderPath + '/'
		})
	}
}

/**
 * Suggestion for a note that has not yet been created.
 * This could either be an existing link to a note that has not been created,
 * or it could be a completely new note that is not linked anywhere
 */
export class NewNoteSuggestion extends NoteSuggestion{
	render(el: HTMLElement): void {
		el.createDiv({
			cls: "suggestion-content",
			text: `🆕 ${this.Title}`
		})
		el.createDiv({
			cls: "suggestion-note",
			text: this.FolderPath + '/'
		})
	}
}

/**
 * Suggestion for an alias to an existing note.
 */
export class AliasNoteSuggestion extends NoteSuggestion{
	private static readonly ALIAS_ICON: string =
		'<svg viewBox="0 0 100 100" class="forward-arrow" width="13" height="13"><path fill="currentColor" stroke="currentColor" d="m9.9,89.09226c-0.03094,0 -0.05414,0 -0.08508,0c-1.06734,-0.04641 -1.91039,-0.92812 -1.89492,-1.99547c0.00774,-0.48726 1.14469,-48.13101 47.52,-49.44586l0,-13.89094c0,-0.7657 0.44086,-1.4618 1.12922,-1.78664c0.68062,-0.33258 1.5082,-0.23203 2.09601,0.2475l31.68,25.74c0.46406,0.37899 0.73476,0.9436 0.73476,1.53914c0,0.59555 -0.2707,1.16016 -0.72703,1.53914l-31.68,25.74c-0.59555,0.47953 -1.41539,0.57234 -2.10375,0.2475c-0.68836,-0.32485 -1.12922,-1.02094 -1.12922,-1.78664l0,-13.84453c-41.26289,0.75024 -43.49039,24.81961 -43.56773,25.85601c-0.06961,1.04414 -0.93586,1.84078 -1.97226,1.84078z"></path></svg>'

	constructor(path: string, alias: string) {
		super(path)
		this.Alias = alias
	}

	render(el: HTMLElement): void {

		const content = el.createDiv({
			cls: "suggestion-content",
			text: `${this.Alias}`
		})

		const flair = content.createSpan({
			cls: "suggestion-flair"
		})
		flair.ariaLabel = "Alias"
		flair.innerHTML = AliasNoteSuggestion.ALIAS_ICON

		el.createDiv({
			cls: "suggestion-note",
			text: this.FolderPath + '/' + this.Title
		})
	}
}
