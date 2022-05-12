export class Suggestion {

	readonly VaultPath: string;
	readonly Title: string;
	readonly FolderPath: string
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
