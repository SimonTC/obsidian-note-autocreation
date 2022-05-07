export class Suggestion{

	readonly VaultPath: string;
	readonly Title: string;
	readonly FolderPath: string

	constructor(vaultPath: string) {
		this.VaultPath = vaultPath;
		this.Title = this.extractTitle(vaultPath);
		this.FolderPath = this.extractFolderPath(vaultPath);
	}

	private extractFolderPath(vaultPath: string): string {
		const fileNameStartsAt = vaultPath.lastIndexOf('/')
		return fileNameStartsAt === -1
			? undefined
			: vaultPath.slice(0, fileNameStartsAt);
	}

	private extractTitle(vaultPath: string): string{
		const fileNameWithPossibleExtension = vaultPath.split('/').pop();
		const extensionStartsAt = fileNameWithPossibleExtension.lastIndexOf('.')

		return extensionStartsAt === -1
			? fileNameWithPossibleExtension
			: fileNameWithPossibleExtension.slice(0, extensionStartsAt);
	}
}

export class SuggestionCollector{
	private metadata: IMetadataCollection;

	constructor(metadata: IMetadataCollection) {
		this.metadata = metadata;
	}

	getSuggestions(): Suggestion[] {
		const suggestions = new Map<string, Suggestion>();
		const unresolvedLinks: Record<string, Record<string, number>> = this.metadata.getUnresolvedLinks();
		for (let pathToFileWithPossibleUnresolvedLink in unresolvedLinks) {
			let suggestion = new Suggestion(pathToFileWithPossibleUnresolvedLink);
			suggestions.set(suggestion.VaultPath, suggestion);

			for (let unresolvedLink in unresolvedLinks[pathToFileWithPossibleUnresolvedLink]) {
				let suggestion = new Suggestion(unresolvedLink);
				suggestions.set(suggestion.VaultPath, suggestion);
			}
		}
		return [...suggestions.values()];
	}
}

/**
 * Interface for accessing metadata from Obsidian
 */
export interface IMetadataCollection{
	getUnresolvedLinks():  Record<string, Record<string, number>>
}
