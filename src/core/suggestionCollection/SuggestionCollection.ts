import {Suggestion} from "../suggestions/Suggestion"

export class SuggestionCollection<TSuggestion extends Suggestion> {
	private readonly query: string
	private validSuggestions: TSuggestion[] = []
	private readonly lowerCaseQueryAsSuggestion: TSuggestion
	suggestionForQueryAlreadyExist: boolean
	existingSuggestionForQuery: TSuggestion
	private readonly createSuggestion: (query: string) => TSuggestion
	readonly queryAsSuggestion: TSuggestion


	constructor(query: string, createSuggestion: (query: string) => TSuggestion) {
		this.createSuggestion = createSuggestion
		this.queryAsSuggestion = createSuggestion(query)
		this.query = query
		const lowerCaseQuery = query.toLowerCase()
		this.lowerCaseQueryAsSuggestion = createSuggestion(lowerCaseQuery)
	}

	/**
	 * Adds a suggestion for the given string if the string is not a suggestion for the query or
	 * the suggestion can't be a descendant of the query
	 * @param suggestionString the string to add
	 */
	addIfDescendantOfAndNotSuggestionForQuery(suggestionString: string) {
		const suggestion = this.createSuggestion(suggestionString)
		const queryIsAncestor = suggestion.FolderPath.toLowerCase().includes(this.lowerCaseQueryAsSuggestion.FolderPath)
		const queryCouldBeForSuggestedNote = suggestion.VaultPath.toLowerCase()
			.replace(this.lowerCaseQueryAsSuggestion.FolderPath, '')
			.includes(this.lowerCaseQueryAsSuggestion.Title)

		const queryIsForSameNoteAsSuggestion = suggestion.VaultPathWithoutExtension.toLowerCase() === this.lowerCaseQueryAsSuggestion.VaultPathWithoutExtension
		if (queryIsForSameNoteAsSuggestion) {
			this.suggestionForQueryAlreadyExist = true
			this.existingSuggestionForQuery = suggestion
			return
		}

		if (queryIsAncestor && queryCouldBeForSuggestedNote) {
			this.validSuggestions.push(suggestion)
		}
	}

	getSortedSuggestions(): TSuggestion[] {
		this.validSuggestions.sort((a, b) => a.Title.localeCompare(b.Title))
		return this.validSuggestions
	}
}
