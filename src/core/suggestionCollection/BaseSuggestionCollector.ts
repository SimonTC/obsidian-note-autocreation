import {Suggestion} from "../suggestions/Suggestion"
import {SuggestionCollection} from "./SuggestionCollection"

export type SuggestionCollectorHelpers<TSuggestion extends Suggestion> = {
	getAllPossibleLinks: () => Set<string>
	createSuggestion: (query: string) => TSuggestion
	createSuggestionForQuery: (query: string) => TSuggestion
	createSuggestionWhenSuggestionForQueryAlreadyExists: (collection: SuggestionCollection<TSuggestion>) => TSuggestion
}

export class BaseSuggestionCollector<TSuggestion extends Suggestion> {
	private readonly getAllPossibleLinks: () => Set<string>
	private readonly createSuggestion: (query: string) => TSuggestion
	private readonly createSuggestionForQuery: (query: string) => TSuggestion
	private readonly createSuggestionWhenSuggestionForQueryAlreadyExists: (collection: SuggestionCollection<TSuggestion>) => TSuggestion
	private readonly includeQueryIfNoLinkExistsForIt: boolean

	constructor(helpers: SuggestionCollectorHelpers<TSuggestion>, includeQueryIfNoLinkExistsForIt: boolean) {
		this.getAllPossibleLinks = helpers.getAllPossibleLinks
		this.createSuggestion = helpers.createSuggestion
		this.createSuggestionWhenSuggestionForQueryAlreadyExists = helpers.createSuggestionWhenSuggestionForQueryAlreadyExists
		this.createSuggestionForQuery = helpers.createSuggestionForQuery
		this.includeQueryIfNoLinkExistsForIt = includeQueryIfNoLinkExistsForIt
	}

	getSuggestions(query: string): TSuggestion[] {
		const suggestionCollection = new SuggestionCollection(query, this.createSuggestion, this.createSuggestionForQuery)
		for (const link of this.getAllPossibleLinks()) {
			suggestionCollection.addIfDescendantOfAndNotSuggestionForQuery(link)
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
