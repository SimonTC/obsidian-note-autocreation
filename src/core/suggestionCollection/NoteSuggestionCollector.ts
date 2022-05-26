import {ExistingNoteSuggestion, NewNoteSuggestion, NoteSuggestion} from "../suggestions/NoteSuggestion"
import {IMetadataCollection} from "../../interop/ObsidianInterfaces"
import {BaseSuggestionCollector} from "./BaseSuggestionCollector"

export class NoteSuggestionCollector {
	private metadata: IMetadataCollection
	private collector: BaseSuggestionCollector<NoteSuggestion>

	constructor(metadata: IMetadataCollection) {
		this.metadata = metadata
		this.collector = new BaseSuggestionCollector({
			getAllPossibleLinks: () => this.getVaultPathsOfAllLinks(),
			createSuggestion: query => new ExistingNoteSuggestion(query),
			createSuggestionForQuery: query => new NewNoteSuggestion(query),
			createSuggestionWhenSuggestionForQueryAlreadyExists: collection => {
				return collection.queryAsSuggestion.HasAlias
					? new ExistingNoteSuggestion(`${collection.existingSuggestionForQuery.VaultPath}|${collection.queryAsSuggestion.Alias}`)
					: collection.existingSuggestionForQuery
			}
		}, true)
	}

	getSuggestions(query: string): NoteSuggestion[] {
		return this.collector.getSuggestions(query)
	}

	private getVaultPathsOfAllLinks(): Set<string> {
		const unresolvedLinks: Record<string, Record<string, number>> = this.metadata.getUnresolvedLinks()

		const vaultPaths = new Set<string>()
		for (const pathToFileWithPossibleUnresolvedLink in unresolvedLinks) {
			vaultPaths.add(pathToFileWithPossibleUnresolvedLink)

			for (const unresolvedLink in unresolvedLinks[pathToFileWithPossibleUnresolvedLink]) {
				vaultPaths.add(unresolvedLink)
			}
		}
		return vaultPaths
	}
}

