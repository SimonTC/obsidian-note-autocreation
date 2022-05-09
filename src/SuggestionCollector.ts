import {Suggestion} from "./Suggestion";
import {IMetadataCollection} from "./ObsidianInterfaces";


export class SuggestionCollector {
	private metadata: IMetadataCollection;

	constructor(metadata: IMetadataCollection) {
		this.metadata = metadata;
	}

	getSuggestions(query: string): Suggestion[] {
		const lowerCaseQuery = query.toLowerCase()
		const lowerCaseQueryAsSuggestion = new Suggestion(lowerCaseQuery);
		const allLinks = [...new Set(this.getVaultPathsOfAllLinks())];
		const suggestions = allLinks
			.map(path => new Suggestion(path))
			.filter(su => su.Title.toLowerCase().includes(lowerCaseQueryAsSuggestion.Title))
			.filter(su => su.FolderPath.toLowerCase().includes(lowerCaseQueryAsSuggestion.FolderPath))
			.sort((a, b) => a.Title.localeCompare(b.Title));

		if (query !== '') {
			suggestions.unshift(new Suggestion(query))
		}

		return suggestions
	}

	private* getVaultPathsOfAllLinks() {
		const unresolvedLinks: Record<string, Record<string, number>> = this.metadata.getUnresolvedLinks();
		for (let pathToFileWithPossibleUnresolvedLink in unresolvedLinks) {
			yield pathToFileWithPossibleUnresolvedLink;

			for (let unresolvedLink in unresolvedLinks[pathToFileWithPossibleUnresolvedLink]) {
				yield unresolvedLink;
			}
		}
	}
}
