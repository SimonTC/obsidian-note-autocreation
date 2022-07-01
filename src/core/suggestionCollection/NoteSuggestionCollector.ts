import {
	AliasNoteSuggestion,
	ExistingNoteSuggestion,
	NewNoteSuggestion,
	NoteSuggestion
} from "../suggestions/NoteSuggestion"
import {IMetadataCollection} from "../../interop/ObsidianInterfaces"
import {BaseSuggestionCollector, VaultPathInfo} from "./BaseSuggestionCollector"
import {NoteAutoCreatorSettings} from "../../settings/NoteAutoCreatorSettings"

export class NoteSuggestionCollector {
	private metadata: IMetadataCollection
	private collector: BaseSuggestionCollector<NoteSuggestion>

	constructor(metadata: IMetadataCollection, settings: NoteAutoCreatorSettings) {
		this.metadata = metadata
		this.collector = new BaseSuggestionCollector({
			getAllPossibleVaultPaths: () => this.getVaultPathsOfAllLinks(),
			createSuggestion: this.createSuggestion,
			createSuggestionWhenSuggestionForQueryAlreadyExists: collection => {
				return collection.queryAsSuggestion.HasAlias
					? new ExistingNoteSuggestion(`${collection.existingSuggestionForQuery.VaultPath}|${collection.queryAsSuggestion.Alias}`)
					: collection.existingSuggestionForQuery
			}
		}, true, settings)
	}

	getSuggestions(query: string): NoteSuggestion[] {
		return this.collector.getSuggestions(query)
	}

	private createSuggestion(pathInfo: VaultPathInfo, trigger: string): NoteSuggestion{
		if(pathInfo.pathIsToExistingNote){
			if (pathInfo.alias && (pathInfo.alias as string).toLowerCase().includes(trigger)){
				return new AliasNoteSuggestion(pathInfo.path, pathInfo.alias as string)
			} else {
				return new ExistingNoteSuggestion(pathInfo.path)
			}
		} else {
			return new NewNoteSuggestion(pathInfo.path)
		}
	}

	private getVaultPathsOfAllLinks(): Set<VaultPathInfo> {
		const observedPaths = new Set<string>()
		const vaultPathInfos = new Set<VaultPathInfo>()
		const addIfPathHasNotBeSeen = (path: string, exist: boolean, alias: string | unknown) => {
			const pathHasBeenSeen = observedPaths.has(path)
			if (alias || !pathHasBeenSeen){
				vaultPathInfos.add({path: path, pathIsToExistingNote: exist, alias: alias})
				observedPaths.add(path)
			}
			return !pathHasBeenSeen
		}

		const linkSuggestions = this.metadata.getLinkSuggestions()
		for (const linkSuggestion of linkSuggestions) {
			addIfPathHasNotBeSeen(linkSuggestion.path, linkSuggestion.file !== null, linkSuggestion.alias)
		}
		return vaultPathInfos
	}
}

