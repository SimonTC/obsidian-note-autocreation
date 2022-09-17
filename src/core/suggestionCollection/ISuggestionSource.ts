import {Query} from "../queries/Query"
import {ISuggestion} from "../suggestions/ISuggestion"

export interface ISuggestionSource<TSuggestion extends ISuggestion> {
	/**
	 * Returns all suggestions that the source has access to.
	 * @param query The query that is used in the search. This might be used to create the suggestion objects, but is not used to influence what is returned.
	 */
	getAllPossibleSuggestions(query: Query<TSuggestion>): TSuggestion[]

	/**
	 * Creates a suggestion from the given query.
	 * @param query query to use for creating the suggestion.
	 * @param existingSuggestionForQuery If a suggestion already has been found for the query it should be passed to this method as it might change what kind of suggestion is created.
	 */
	createSuggestionFromQuery(query: Query<TSuggestion>, existingSuggestionForQuery: undefined | TSuggestion): TSuggestion
}
