import {ObsidianPath} from "./ObsidianPath"
import {ObsidianFolderPath} from "./ObsidianFolderPath"

/**
 * Path to a file in the obsidian vault.
 * This will never include aliases or links to headers.
 */
export class ObsidianFilePath extends ObsidianPath{

	/**
	 * The full obsidian vault path to the file.
	 */
	readonly VaultPath: string

	/**
	 * The full obsidian vault path to the file without the file extensions.
	 */
	readonly VaultPathWithoutExtension: string

	/**
	 * The title of the file.
	 * Extension is not included in the title.
	 */
	readonly Title: string

	/**
	 * The path to the folder where the file is stored.
	 */
	readonly FolderPath: ObsidianFolderPath

	/**
	 * True if this is a path to a file in the root of the vault.
	 */
	readonly NoteIsInRoot: boolean

	/**
	 * The extension for the file
	 */
	readonly Extension: string

	/**
	 * The full name of the file including an extension if it exists.
	 * Will be empty if this is a path to a folder.
	 */
	readonly FileNameWithPossibleExtension: string

	/**
	 * Returns true if this path is for the root folder.
	 */
	get IsRoot(){return this.VaultPath === '' || this.VaultPath === '/'}

	/**
	 * Constructor for an Obsidian file path.
	 * The constructor will remove any parts coming after an alias symbol (|) or a header symbol (#) but no other special parts.
	 * @param path The path to the file.
	 */
	constructor(path: string) {
		const fullPath = path.trim()
		const {vaultPath, folderPath, title, extension, fileNameWithPossibleExtension} = ObsidianFilePath.extractPathParts(fullPath)
		super(vaultPath, title)
		this.FolderPath = new ObsidianFolderPath(folderPath)
		this.Extension = extension
		this.FileNameWithPossibleExtension = fileNameWithPossibleExtension
		this.NoteIsInRoot = folderPath === '/' || folderPath === ''
		this.VaultPathWithoutExtension = this.NoteIsInRoot ? title : `${folderPath}/${title}`
	}

	private static extractPathParts(fullPath: string): {vaultPath: string, folderPath: string, title: string, extension: string, fileNameWithPossibleExtension: string} {
		// eslint-disable-next-line prefer-const
		let [vaultPath] = fullPath.split(/[|#]/)
		const fileNameStartsAt = vaultPath.lastIndexOf('/')
		const [folderPath, fileNameWithPossibleExtension] = fileNameStartsAt === -1
			? ['', vaultPath]
			: [vaultPath.slice(0, fileNameStartsAt), vaultPath.slice(fileNameStartsAt + 1) ]

		const extensionStartsAt = fileNameWithPossibleExtension.lastIndexOf('.')
		const title = extensionStartsAt === -1
			? fileNameWithPossibleExtension
			: fileNameWithPossibleExtension.slice(0, extensionStartsAt)
		const extension = extensionStartsAt !== -1
			? fileNameWithPossibleExtension.slice(extensionStartsAt + 1)
			: ''
		return {vaultPath, folderPath, title, extension, fileNameWithPossibleExtension}
	}
}
