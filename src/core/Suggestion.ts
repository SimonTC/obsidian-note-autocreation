import {ObsidianFilePath} from "./ObsidianFilePath"

/**
 * Base class for all suggestion types.
 */
export abstract class Suggestion {
	/**
	 * The string that triggered the suggestion.
	 */
	readonly Trigger: string

	/**
	 * The full obsidian vault path to the item.
	 * Might include the extension of the item.
	 */
	get VaultPath(): string {
		return this.Path.VaultPath
	}

	/**
	 * The full obsidian vault path to the suggested item.
	 * Will never include the extension of the item.
	 */
	get VaultPathWithoutExtension(): string {
		return this.Path.VaultPathWithoutExtension
	}

	/**
	 * The title of the item.
	 * Extension is not included in the title.
	 */
	get Title(): string {
		return this.Path.Title
	}

	/**
	 * The path to the folder where the item of the suggestion is stored.
	 */
	get FolderPath(): string {
		return this.Path.FolderPath
	}

	/**
	 * True if the suggested item is stored in the root folder.
	 */
	get NoteIsInRoot(): boolean {
		return this.Path.NoteIsInRoot
	}

	/**
	 * The path to the suggested item.
	 */
	readonly Path: ObsidianFilePath

	/**
	 * Renders the suggestion
	 * @param el the parent element in the suggestion list
	 */
	abstract render(el: HTMLElement): void

	protected constructor(trigger: string) {
		this.Path = new ObsidianFilePath(trigger)
		const fullPath = trigger.trim()
		this.Trigger = fullPath
	}
}
