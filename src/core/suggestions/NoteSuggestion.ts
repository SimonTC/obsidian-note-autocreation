import {Suggestion} from "./Suggestion"

/**
 * A suggestion for a new or existing note.
 */
export abstract class NoteSuggestion extends Suggestion{
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

	constructor(path: string, alias: string) {
		super(path)
		this.Alias = alias
	}

	render(el: HTMLElement): void {

		el.createDiv({
			cls: "suggestion-content",
			text: `➡ ${this.Alias}`
		})

		el.createDiv({
			cls: "suggestion-note",
			text: this.FolderPath + '/' + this.Title
		})
	}
}
