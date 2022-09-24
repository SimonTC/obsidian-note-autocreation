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
		const fullPath = path.trim().toLowerCase()
		const folderName = ObsidianFolderPath.getFolderName(fullPath)
		super(fullPath, folderName)
	}

	private static getFolderName(fullPath: string){
		let folderNameStartsAt = fullPath.lastIndexOf('/')
		let folderNameEndsAt = fullPath.length
		if (folderNameStartsAt === -1){
			return fullPath
		}
		if (folderNameStartsAt === fullPath.length - 1){
			// Folder path is "some/folder12/"
			// Title should be "folder12"
			folderNameStartsAt = fullPath.slice(0, folderNameStartsAt).lastIndexOf('/')
			folderNameEndsAt = fullPath.length - 1
		}
		return fullPath.slice(folderNameStartsAt + 1, folderNameEndsAt)
	}

	getParentOrThis(): ObsidianFolderPath {
		if (this.IsRoot){
			return this
		}

		const lastDivider = this.VaultPath.lastIndexOf('/')
		const parentPath = this.VaultPath.substring(0, lastDivider)
		return new ObsidianFolderPath(parentPath)
	}

	isAncestorOf(path: ObsidianPath): boolean{
		if (this.IsRoot){
			return true
		}
		return path.VaultPath.toLowerCase().startsWith(this.VaultPath.toLowerCase())
	}
}
