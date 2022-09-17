import {ISuggestion, Suggestion} from "../suggestions/ISuggestion"
import {Query} from "../queries/Query"
import {ISuggestionSource} from "./ISuggestionSource"

export class BaseSuggestionCollector2<TSuggestion extends ISuggestion>{
	private readonly suggestionSource: ISuggestionSource<TSuggestion>

	constructor(suggestionSource: ISuggestionSource<TSuggestion>) {
		this.suggestionSource = suggestionSource
	}

	getSuggestions(query: Query<TSuggestion>): TSuggestion[] {
		let existingSuggestionForQuery: TSuggestion
		const validSuggestions: TSuggestion[] = []

		for (const suggestion of this.suggestionSource.getAllPossibleSuggestions(query)) {
			const queryResult = query.couldBeQueryFor(suggestion)

			if (queryResult.isCompleteMatch) {
				existingSuggestionForQuery = suggestion
				continue
			}

			if (queryResult.isAtLeastPartialMatch) {
				validSuggestions.push(suggestion)
			}
		}

		validSuggestions.sort(Suggestion.compare)

		if (query.IsEmpty) {
			return validSuggestions
		}

		validSuggestions.unshift(this.suggestionSource.createSuggestionFromQuery(query, existingSuggestionForQuery))
		return validSuggestions
	}
}


export abstract class BaseSuggestionCollector<TSuggestion extends ISuggestion> {
	getSuggestions(query: Query<TSuggestion>): TSuggestion[] {
		let existingSuggestionForQuery: TSuggestion
		const validSuggestions: TSuggestion[] = []

		for (const suggestion of this.getAllPossibleSuggestions(query)) {
			const queryResult = query.couldBeQueryFor(suggestion)

			if (queryResult.isCompleteMatch) {
				existingSuggestionForQuery = suggestion
				continue
			}

			if (queryResult.isAtLeastPartialMatch) {
				validSuggestions.push(suggestion)
			}
		}

		validSuggestions.sort(Suggestion.compare)

		if (query.IsEmpty) {
			return validSuggestions
		}

		validSuggestions.unshift(this.createSuggestionFromQuery(query, existingSuggestionForQuery))
		return validSuggestions
	}

	protected abstract createSuggestionFromQuery(query: Query<TSuggestion>, existingSuggestionForQuery: undefined | TSuggestion): TSuggestion

	protected abstract getAllPossibleSuggestions(query: Query<TSuggestion>): TSuggestion[]
}
