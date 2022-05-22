import {ObsidianFilePath} from "./ObsidianFilePath"

export class Suggestion {

	/**
	 * The string that triggered the suggestion.
	 */
	readonly Trigger: string

	/**
	 * The full obsidian vault path to the note that would be created or chosen if this suggestion is selected.
	 * Might include the extension of the note.
	 */
	get VaultPath(): string {return this.Path.VaultPath}

	/**
	 * The full obsidian vault path to the note that would be created or chosen if this suggestion is selected.
	 * Will never include the .md extension of the note.
	 */
	get VaultPathWithoutExtension(): string {return this.Path.VaultPathWithoutExtension}

	/**
	 * The title of the note. This is used as the file name of the note if it created.
	 * Extension is not included in the title.
	 */
	get Title(): string {return this.Path.Title}

	/**
	 * The path to the folder where the note of the suggestion is stored.
	 */
	get FolderPath(): string {return this.Path.FolderPath}

	/**
	 * True if the suggested note wil be placed in the root folder.
	 */
	get NoteIsInRoot(): boolean {return this.Path.NoteIsInRoot}

	/**
	 * The alias of the suggestion. This is the name that is shown in the document where the link is inserted.
	 */
	readonly Alias: string | undefined

	/**
	 * The path to the note.
	 */
	readonly Path: ObsidianFilePath

	/**
	 * Returns true if the suggestion contains an alias.
	 */
	get HasAlias() {return this.Alias && this.Alias.length > 0}

	constructor(trigger: string) {
		this.Path = new ObsidianFilePath(trigger)
		const fullPath = trigger.trim()
		this.Trigger = fullPath
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
}
