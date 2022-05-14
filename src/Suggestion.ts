export class Suggestion {

	/**
	 * The string that triggered the suggestion.
	 */
	readonly Trigger: string

	/**
	 * The full obsidian vault path to the note that would be created or chosen if this suggestion is selected.
	 * Might include the extension of the note.
	 */
	readonly VaultPath: string;

	/**
	 * The full obsidian vault path to the note that would be created or chosen if this suggestion is selected.
	 * Will never include the .md extension of the note.
	 */
	readonly VaultPathWithoutExtension: string

	/**
	 * The title of the note. This is used as the file name of the note if it created.
	 * Extension is not included in the title.
	 */
	readonly Title: string;

	/**
	 * The path to the folder where the note of the suggestion is stored.
	 */
	readonly FolderPath: string

	/**
	 * True if the suggested note wil be placed in the root folder.
	 */
	readonly NoteIsInRoot: boolean

	/**
	 * The alias of the suggestion. This is the name that is shown in the document where the link is inserted.
	 */
	readonly Alias: string | undefined

	constructor(trigger: string) {
		const fullPath = trigger.trim();
		this.Trigger = fullPath;
		const {vaultPath, folderPath, title, alias} = this.extractSuggestionParts(fullPath);
		this.VaultPath = vaultPath;
		this.Title = title
		this.Alias = alias
		this.FolderPath = folderPath;
		this.NoteIsInRoot = folderPath === '/' || folderPath === ''
		this.VaultPathWithoutExtension = vaultPath.replace('.md', '')
	}

	private extractSuggestionParts(trigger: string): {vaultPath: string, folderPath: string, title: string, alias: string} {
		// eslint-disable-next-line prefer-const
		let [vaultPath, alias] = trigger.split('|')
		const fileNameStartsAt = vaultPath.lastIndexOf('/')
		const [folderPath, fileNameWithPossibleExtension] = fileNameStartsAt === -1
			? ['', vaultPath]
			: [vaultPath.slice(0, fileNameStartsAt), vaultPath.slice(fileNameStartsAt + 1) ]

		const extensionStartsAt = fileNameWithPossibleExtension.lastIndexOf('.')
		const title = extensionStartsAt === -1
			? fileNameWithPossibleExtension
			: fileNameWithPossibleExtension.slice(0, extensionStartsAt);
		alias = alias?.length === 0 ? undefined : alias?.trim()
		return {vaultPath, folderPath, title, alias};
	}
}
