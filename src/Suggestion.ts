export class Suggestion {

	readonly VaultPath: string;
	readonly Title: string;
	readonly FolderPath: string

	constructor(vaultPath: string) {
		const fullPath = vaultPath.trim()
		this.VaultPath = fullPath;
		this.Title = this.extractTitle(fullPath);
		this.FolderPath = this.extractFolderPath(fullPath);
	}

	private extractFolderPath(vaultPath: string): string {
		const fileNameStartsAt = vaultPath.lastIndexOf('/')
		return fileNameStartsAt === -1
			? ''
			: vaultPath.slice(0, fileNameStartsAt);
	}

	private extractTitle(vaultPath: string): string {
		const fileNameWithPossibleExtension = vaultPath.split('/').pop();
		const extensionStartsAt = fileNameWithPossibleExtension.lastIndexOf('.')

		return extensionStartsAt === -1
			? fileNameWithPossibleExtension
			: fileNameWithPossibleExtension.slice(0, extensionStartsAt);
	}
}
