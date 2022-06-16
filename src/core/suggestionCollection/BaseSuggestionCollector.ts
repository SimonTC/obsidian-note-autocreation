import {Suggestion} from "../suggestions/Suggestion"
import {SuggestionCollection} from "./SuggestionCollection"

export type VaultPathInfo = {
	path: string
	pathIsToExistingNote: boolean
	alias: string | unknown
}

export type SuggestionCollectorHelpers<TSuggestion extends Suggestion> = {
	getAllPossibleVaultPaths: () => Set<VaultPathInfo>
	createSuggestion: (vaultPathInfo: VaultPathInfo) => TSuggestion
	createSuggestionWhenSuggestionForQueryAlreadyExists: (collection: SuggestionCollection<TSuggestion>) => TSuggestion
}

export class BaseSuggestionCollector<TSuggestion extends Suggestion> {
	private readonly getAllPossibleVaultPaths: () => Set<VaultPathInfo>
	private readonly createSuggestion: (suggestionInfo: VaultPathInfo) => TSuggestion
	private readonly createSuggestionWhenSuggestionForQueryAlreadyExists: (collection: SuggestionCollection<TSuggestion>) => TSuggestion
	private readonly includeQueryIfNoLinkExistsForIt: boolean

	constructor(helpers: SuggestionCollectorHelpers<TSuggestion>, includeQueryIfNoLinkExistsForIt: boolean) {
		this.getAllPossibleVaultPaths = helpers.getAllPossibleVaultPaths
		this.createSuggestion = helpers.createSuggestion
		this.createSuggestionWhenSuggestionForQueryAlreadyExists = helpers.createSuggestionWhenSuggestionForQueryAlreadyExists
		this.includeQueryIfNoLinkExistsForIt = includeQueryIfNoLinkExistsForIt
	}

	getSuggestions(query: string): TSuggestion[] {
		const suggestionCollection = new SuggestionCollection(query, this.createSuggestion)
		for (const vaultPathInfo of this.getAllPossibleVaultPaths()) {
			suggestionCollection.addIfDescendantOfAndNotSuggestionForQuery(vaultPathInfo)
		}

		const suggestions = suggestionCollection.getSortedSuggestions()
		if (query === '') {
			return suggestions
		}

		if (suggestionCollection.suggestionForQueryAlreadyExist){
			suggestions.unshift(this.createSuggestionWhenSuggestionForQueryAlreadyExists(suggestionCollection))
		} else{
			if(this.includeQueryIfNoLinkExistsForIt){
				suggestions.unshift(suggestionCollection.queryAsSuggestion)
			}
		}

		return suggestions
	}
}
