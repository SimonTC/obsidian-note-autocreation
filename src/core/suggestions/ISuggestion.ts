/**
 * Interface for any suggestions returned by Note Auto Creator
 */
import {ObsidianPath} from "../paths/ObsidianPath"

export interface ISuggestion {

	/**
	 * The title of the item.
	 * Any potential extension is not included in the title.
	 */
	get Title(): string

	/**
	 * The path to the item
	 */
	get Path(): ObsidianPath

	/**
	 * Returns the text to insert if this suggestion has been chosen to update the selected suggestion
	 */
	get textToInsertOnLineUpdate(): string

	/**
	 * Renders the suggestion
	 * @param el the parent element in the suggestion list
	 */
	render(el: HTMLElement): void
}

export abstract class Suggestion{
	static compare(a: ISuggestion, b: ISuggestion){
		return a.Title.localeCompare(b.Title)
	}
}
