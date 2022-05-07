export class Suggestion{

	readonly VaultPath: string;

	constructor(expectedPath: string) {
		this.VaultPath = expectedPath;
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
