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
	doesNoteExist(notePath: string): boolean
}
