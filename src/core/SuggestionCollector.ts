import {Suggestion} from "./Suggestion"
import {IMetadataCollection} from "../interop/ObsidianInterfaces"

class SuggestionCollection{
	private readonly query: string
	private validSuggestions: Suggestion[] = []
	private readonly lowerCaseQueryAsSuggestion: Suggestion
	suggestionForQueryAlreadyExist: boolean
	private queryAsSuggestion: Suggestion

	private constructor(query: string) {
		this.query = query
		const lowerCaseQuery = query.toLowerCase()
		this.lowerCaseQueryAsSuggestion = new Suggestion(lowerCaseQuery)
		this.queryAsSuggestion = new Suggestion(query)
	}

	add(suggestionString: string){
		let suggestion = new Suggestion(suggestionString)
		const queryIsAncestor = suggestion.FolderPath.toLowerCase().includes(this.lowerCaseQueryAsSuggestion.FolderPath)
		const queryCouldBeForSuggestedNote = suggestion.VaultPath.toLowerCase()
			.replace(this.lowerCaseQueryAsSuggestion.FolderPath, '')
			.includes(this.lowerCaseQueryAsSuggestion.Title)

		const queryIsForSameNoteAsSuggestion = suggestion.VaultPathWithoutExtension.toLowerCase() === this.lowerCaseQueryAsSuggestion.VaultPathWithoutExtension
		if (queryIsForSameNoteAsSuggestion){
			this.suggestionForQueryAlreadyExist = true
			if (this.queryAsSuggestion.HasAlias){
				suggestion = new Suggestion(`${suggestion.VaultPath}|${this.queryAsSuggestion.Alias}`)
			}
		}

		if (queryIsAncestor && queryCouldBeForSuggestedNote){
			this.validSuggestions.push(suggestion)
		}
	}

	getSortedSuggestions() : Suggestion[]{
		this.validSuggestions.sort((a, b) => a.Title.localeCompare(b.Title))
		return this.validSuggestions
	}

	static for(query: string){
		return new SuggestionCollection(query)
	}
}


export class SuggestionCollector {
	private metadata: IMetadataCollection

	constructor(metadata: IMetadataCollection) {
		this.metadata = metadata
	}

	getSuggestions(query: string): Suggestion[] {
		const suggestionCollection = SuggestionCollection.for(query)
		const allLinks = [...new Set(this.getVaultPathsOfAllLinks())]
		for (let i = 0; i < allLinks.length; i++) {
			suggestionCollection.add(allLinks[i])
		}

		const suggestions = suggestionCollection.getSortedSuggestions()
		if(query === '' || suggestionCollection.suggestionForQueryAlreadyExist){
			return suggestions
		}

		suggestions.unshift(new Suggestion(query))
		return suggestions
	}

	private* getVaultPathsOfAllLinks() {
		const unresolvedLinks: Record<string, Record<string, number>> = this.metadata.getUnresolvedLinks()
		for (const pathToFileWithPossibleUnresolvedLink in unresolvedLinks) {
			yield pathToFileWithPossibleUnresolvedLink

			for (const unresolvedLink in unresolvedLinks[pathToFileWithPossibleUnresolvedLink]) {
				yield unresolvedLink
			}
		}
	}
}
