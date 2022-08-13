import {ObsidianPath} from "./ObsidianPath"

export class ObsidianFolderPath extends ObsidianPath {

	/**
	 * Returns true if this path is for the root folder.
	 */
	get IsRoot() {
		return this.VaultPath === '' || this.VaultPath === '/'
	}

	/**
	 * Constructor for an Obsidian file path.
	 * The constructor will remove any parts coming after an alias symbol (|) or a header symbol (#) but no other special parts.
	 * @param path The path to the file.
	 */
	constructor(path: string) {
		const fullPath = path.trim()
		const folderNameEndsAt = fullPath.lastIndexOf('/')
		const folderNameStartsAt = fullPath.slice(0, folderNameEndsAt).lastIndexOf('/')
		const folderName = fullPath.slice(folderNameStartsAt + 1, folderNameEndsAt)
		super(fullPath, folderName)
	}
}
