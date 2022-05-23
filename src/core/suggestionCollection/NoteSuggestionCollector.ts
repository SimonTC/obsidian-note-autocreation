import {NoteSuggestion} from "../NoteSuggestion"
import {IMetadataCollection} from "../../interop/ObsidianInterfaces"
import {SuggestionCollector} from "./SuggestionCollector"

export class NoteSuggestionCollector {
	private metadata: IMetadataCollection
	private collector: SuggestionCollector<NoteSuggestion>

	constructor(metadata: IMetadataCollection) {
		this.metadata = metadata
		this.collector = new SuggestionCollector({
			getAllPossibleLinks: () => this.getVaultPathsOfAllLinks(),
			createSuggestion: query => new NoteSuggestion(query),
			createSuggestionWhenSuggestionForQueryAlreadyExists: collection => new NoteSuggestion(`${collection.existingSuggestionForQuery.VaultPath}|${collection.queryAsSuggestion.Alias}`)
		})
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
