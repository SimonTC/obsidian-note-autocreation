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
	getOrCreateFileAndFoldersInPath(creationCommand: LinkCreationCommand, currentFile: IFile): Promise<TFile>
}

/**
 * Interface for the obsidian type EditorSuggestContext
 */
export interface IEditorSuggestContext {
	editor: IEditor
	file: IFile
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
 * Interface for the obsidian type TFile
 */
export interface IFile {
	path: string
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
