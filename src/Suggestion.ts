export class Suggestion {

	/**
	 * The string that triggered the suggestion.
	 */
	readonly Trigger: string

	/**
	 * The full obsidian vault path to the note that would be created or chosen if this suggestion is selected.
	 * Does not necessarily include the extension of the note.
	 */
	readonly VaultPath: string;

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
	 * The alias of the suggestion. This is the name that is shown in the document where the link is inserted.
	 */
	readonly Alias: string

	constructor(vaultPath: string) {
		const fullPath = vaultPath.trim()
		this.VaultPath = fullPath;
		let {title, alias} = this.extractTitleAndAlias(fullPath);
		this.Title = title
		this.Alias = alias
		this.FolderPath = this.extractFolderPath(fullPath);
	}

	private extractFolderPath(vaultPath: string): string {
		const fileNameStartsAt = vaultPath.lastIndexOf('/')
		return fileNameStartsAt === -1
			? ''
			: vaultPath.slice(0, fileNameStartsAt);
	}

	private extractTitleAndAlias(vaultPath: string): {title: string, alias: string} {
		const fileNameWithPossibleExtension = vaultPath.split('/').pop();
		const extensionStartsAt = fileNameWithPossibleExtension.lastIndexOf('.')
		const titleWithPossibleAlias = extensionStartsAt === -1
			? fileNameWithPossibleExtension
			: fileNameWithPossibleExtension.slice(0, extensionStartsAt);
		let [title, alias] = titleWithPossibleAlias.split('|')
		alias = alias?.length === 0 ? undefined : alias
		return {title, alias};
	}
}
