import {ISuggestion} from "./ISuggestion"
import {ObsidianFilePath} from "../paths/ObsidianFilePath"
import {ObsidianFolderPath} from "../paths/ObsidianFolderPath"

/**
 * Base class for all suggestions for any types of files.
 */
export abstract class FileSuggestion implements ISuggestion{
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

	get Title(): string {
		return this.Path.Title
	}

	/**
	 * The path to the folder where the item of the suggestion is stored.
	 */
	get FolderPath(): ObsidianFolderPath {
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

	abstract render(el: HTMLElement): void

	abstract get textToInsertOnLineUpdate(): string

	protected constructor(trigger: string) {
		this.Path = new ObsidianFilePath(trigger)
		const fullPath = trigger.trim()
		this.Trigger = fullPath
	}
}
