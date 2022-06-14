import {ExistingNoteSuggestion, NewNoteSuggestion, NoteSuggestion} from "../suggestions/NoteSuggestion"
import {IMetadataCollection} from "../../interop/ObsidianInterfaces"
import {BaseSuggestionCollector, VaultPathInfo} from "./BaseSuggestionCollector"

export class NoteSuggestionCollector {
	private metadata: IMetadataCollection
	private collector: BaseSuggestionCollector<NoteSuggestion>

	constructor(metadata: IMetadataCollection) {
		this.metadata = metadata
		this.collector = new BaseSuggestionCollector({
			getAllPossibleVaultPaths: () => this.getVaultPathsOfAllLinks(),
			createSuggestion: suggestionInfo => suggestionInfo.pathIsToExistingNote ? new ExistingNoteSuggestion(suggestionInfo.path) : new NewNoteSuggestion(suggestionInfo.path),
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

	private getVaultPathsOfAllLinks(): Set<VaultPathInfo> {
		const unresolvedLinks: Record<string, Record<string, number>> = this.metadata.getUnresolvedLinks()
		const observedPaths = new Set<string>()
		const vaultPathInfos = new Set<VaultPathInfo>()
		const addIfPathHasNotBeSeen = (path: string, exist: boolean) => {
			const pathHasBeenSeen = observedPaths.has(path)
			if (!pathHasBeenSeen){
				vaultPathInfos.add({path: path, pathIsToExistingNote: exist})
				observedPaths.add(path)
			}
			return !pathHasBeenSeen
		}

		for (const pathToFileWithPossibleUnresolvedLink in unresolvedLinks) {
			addIfPathHasNotBeSeen(pathToFileWithPossibleUnresolvedLink, true)

			for (const unresolvedLink in unresolvedLinks[pathToFileWithPossibleUnresolvedLink]) {
				addIfPathHasNotBeSeen(unresolvedLink, false)
			}
		}
		return vaultPathInfos
	}
}

