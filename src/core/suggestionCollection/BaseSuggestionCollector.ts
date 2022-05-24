import {Suggestion} from "../suggestions/Suggestion"
import {SuggestionCollection} from "./SuggestionCollection"

export type SuggestionCollectorHelpers<TSuggestion extends Suggestion> = {
	getAllPossibleLinks: () => Set<string>
	createSuggestion: (query: string) => TSuggestion
	createSuggestionWhenSuggestionForQueryAlreadyExists: (collection: SuggestionCollection<TSuggestion>) => TSuggestion
}

export class BaseSuggestionCollector<TSuggestion extends Suggestion> {
	private readonly getAllPossibleLinks: () => Set<string>
	private readonly createSuggestion: (query: string) => TSuggestion
	private readonly createSuggestionWhenSuggestionForQueryAlreadyExists: (collection: SuggestionCollection<TSuggestion>) => TSuggestion

	constructor({getAllPossibleLinks,createSuggestion,createSuggestionWhenSuggestionForQueryAlreadyExists}: SuggestionCollectorHelpers<TSuggestion>) {
		this.getAllPossibleLinks = getAllPossibleLinks
		this.createSuggestion = createSuggestion
		this.createSuggestionWhenSuggestionForQueryAlreadyExists = createSuggestionWhenSuggestionForQueryAlreadyExists
	}

	getSuggestions(query: string): TSuggestion[] {
		const suggestionCollection = new SuggestionCollection(query, this.createSuggestion)
		for (const link of this.getAllPossibleLinks()) {
			suggestionCollection.addIfDescendantOfAndNotSuggestionForQuery(link)
		}

		const suggestions = suggestionCollection.getSortedSuggestions()
		if (query === '') {
			return suggestions
		}

		const suggestionForQuery = suggestionCollection.suggestionForQueryAlreadyExist
			? this.createSuggestionWhenSuggestionForQueryAlreadyExists(suggestionCollection)
			: suggestionCollection.queryAsSuggestion

		suggestions.unshift(suggestionForQuery)
		return suggestions
	}
}
