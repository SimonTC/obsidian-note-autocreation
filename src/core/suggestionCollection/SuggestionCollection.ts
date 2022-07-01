import {Suggestion} from "../suggestions/Suggestion"
import {VaultPathInfo} from "./BaseSuggestionCollector"
import {AliasNoteSuggestion} from "../suggestions/NoteSuggestion"

export class SuggestionCollection<TSuggestion extends Suggestion> {
	private readonly query: string
	private readonly lowerCaseQuery: string
	private validSuggestions: TSuggestion[] = []
	private readonly lowerCaseQueryAsSuggestion: TSuggestion
	suggestionForQueryAlreadyExist: boolean
	existingSuggestionForQuery: TSuggestion
	private readonly createSuggestion: (vaultPathInfo: VaultPathInfo, trigger: string) => TSuggestion
	readonly queryAsSuggestion: TSuggestion


	constructor(query: string, createSuggestion: (vaultPathInfo: VaultPathInfo, trigger: string) => TSuggestion) {
		this.createSuggestion = createSuggestion
		this.queryAsSuggestion = createSuggestion({path: query, pathIsToExistingNote: false, alias: null}, query)
		this.query = query
		this.lowerCaseQuery = query.toLowerCase()
		this.lowerCaseQueryAsSuggestion = createSuggestion({path: this.lowerCaseQuery, pathIsToExistingNote: false, alias: null}, this.lowerCaseQuery)
	}

	/**
	 * Adds a suggestion for the given string if the string is not a suggestion for the query or
	 * the suggestion can't be a descendant of the query
	 * @param vaultPathInfo information about the vault path to create a suggestion for
	 */
	addIfDescendantOfAndNotSuggestionForQuery(vaultPathInfo: VaultPathInfo) {
		const suggestion = this.createSuggestion(vaultPathInfo, this.lowerCaseQuery)
		const queryIsAncestor = suggestion.FolderPath.toLowerCase().includes(this.lowerCaseQueryAsSuggestion.FolderPath)
		const queryCouldBeForSuggestedNote = suggestion.VaultPath.toLowerCase()
			.replace(this.lowerCaseQueryAsSuggestion.FolderPath, '')
			.includes(this.lowerCaseQueryAsSuggestion.Title)

		let queryCouldBeAliasForSuggestion = false
		if (suggestion instanceof AliasNoteSuggestion){
			queryCouldBeAliasForSuggestion = suggestion.Alias.toLowerCase().includes(this.lowerCaseQueryAsSuggestion.Title)
		}

		const queryIsForSameNoteAsSuggestion = suggestion.VaultPathWithoutExtension.toLowerCase() === this.lowerCaseQueryAsSuggestion.VaultPathWithoutExtension
		if (queryIsForSameNoteAsSuggestion) {
			this.suggestionForQueryAlreadyExist = true
			this.existingSuggestionForQuery = suggestion
			return
		}

		if ((queryIsAncestor && queryCouldBeForSuggestedNote) || queryCouldBeAliasForSuggestion) {
			this.validSuggestions.push(suggestion)
		}
	}

	getSortedSuggestions(): TSuggestion[] {
		this.validSuggestions.sort(Suggestion.compare)
		return this.validSuggestions
	}
}
