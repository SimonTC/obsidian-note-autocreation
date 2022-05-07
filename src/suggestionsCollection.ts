export class Suggestion{

	readonly VaultPath: string;
	readonly Title: string;

	constructor(vaultPath: string) {
		this.VaultPath = vaultPath;
		this.Title = this.extractTitle(vaultPath);
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
		const suggestions = [];
		for (let filePath in this.metadata.getUnresolvedLinks()) {
			let suggestion = new Suggestion(filePath);
			suggestions.push(suggestion)
		}
		return suggestions;
	}
}

/**
 * Interface for accessing metadata from Obsidian
 */
export interface IMetadataCollection{
	getUnresolvedLinks():  Record<string, Record<string, number>>
}
