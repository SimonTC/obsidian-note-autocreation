export abstract class ObsidianPath {
	/**
	 * The full obsidian vault path to the file.
	 */
	readonly VaultPath: string

	/**
	 * The title of the item.
	 * No extensions are included in the title.
	 */
	readonly Title: string

	protected constructor(vaultPath: string, title: string) {
		this.VaultPath = vaultPath
		this.Title = title
	}
}
