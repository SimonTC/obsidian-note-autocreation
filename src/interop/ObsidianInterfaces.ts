import {LinkCreationCommand} from "../core/LinkCreationPreparer"
import {TFile} from "obsidian"
import {DocumentLocation} from "../core/suggestionExtraction"

/**
 * Interface for accessing metadata from Obsidian
 */
export interface IMetadataCollection{
	getUnresolvedLinks():  Record<string, Record<string, number>>
}

/**
 * Contains methods for interacting and getting information about the file system through Obsidian.
 */
export interface IFileSystem{
	/**
	 * Returns true if a note exist with the given path
	 * @param notePath the path to check
	 */
	noteExists(notePath: string): boolean

	/**
	 * Returns true if a folder exists with the given path
	 * @param folderPath the path to check
	 */
	folderExists(folderPath: string): boolean

	/**
	 * Returns the file if it already exists. Otherwise it will create the file and folders.
	 * @param creationCommand the command used for creating the file and folders
	 * @param suggestion the suggestion that should be converted to a note
	 * @param currentFile the file currently active in Obsidian
	 */
	getOrCreateFileAndFoldersInPath(creationCommand: LinkCreationCommand, currentFile: TFile): Promise<TFile>

	/**
	 * Generate a markdown link based on the user's preferences.
	 *
	 * @param file – the file to link to.
	 * @param sourcePath – where the link is stored in, used to compute relative links.
	 * @param subpath – A subpath, starting with #, used for linking to headings or blocks.
	 * @param alias – The display text if it's to be different than the file name. Pass empty string to use file name.
	 */
	generateMarkdownLink(file: TFile, sourcePath: string, subpath?: string, alias?: string): string;

	/**
	 * Returns all files that are in the given folder or any of its descendant folders
	 * @param folderPath the path to the folder to start from
	 */
	getAllFileDescendantsOf(folderPath: string): TFile[]
}

/**
 * Interface for the obsidian type EditorSuggestContext
 */
export interface IEditorSuggestContext {
	editor: IEditor
	file: TFile
	query: string
}

/**
 * Interface for the obsidian type Editor
 */
export interface IEditor {
	getLine(line: number): string
	replaceRange(replacement: string, from: DocumentLocation, to?: DocumentLocation, origin?: string): void;
	setCursor(pos: DocumentLocation | number, ch?: number): void;
}

/**
 * Interface for getting configuration values.
 */
export interface IConfigurationStore{

	/**
	 * Gets the current value for the configuration with the given key.
	 */
	getValueFor(configKey: string): any
}

/**
 * Main interface for interacting with Obsidian
 */
export interface IObsidianInterop extends IFileSystem, IMetadataCollection, IConfigurationStore{

}
