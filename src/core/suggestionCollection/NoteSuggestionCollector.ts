import {NoteSuggestion} from "../NoteSuggestion"
import {IMetadataCollection} from "../../interop/ObsidianInterfaces"

class NoteSuggestionCollection{
	private readonly query: string
	private validSuggestions: NoteSuggestion[] = []
	private readonly lowerCaseQueryAsSuggestion: NoteSuggestion
	suggestionForQueryAlreadyExist: boolean
	private queryAsSuggestion: NoteSuggestion

	private constructor(query: string) {
		this.query = query
		const lowerCaseQuery = query.toLowerCase()
		this.lowerCaseQueryAsSuggestion = new NoteSuggestion(lowerCaseQuery)
		this.queryAsSuggestion = new NoteSuggestion(query)
	}

	add(suggestionString: string){
		let suggestion = new NoteSuggestion(suggestionString)
		const queryIsAncestor = suggestion.FolderPath.toLowerCase().includes(this.lowerCaseQueryAsSuggestion.FolderPath)
		const queryCouldBeForSuggestedNote = suggestion.VaultPath.toLowerCase()
			.replace(this.lowerCaseQueryAsSuggestion.FolderPath, '')
			.includes(this.lowerCaseQueryAsSuggestion.Title)

		const queryIsForSameNoteAsSuggestion = suggestion.VaultPathWithoutExtension.toLowerCase() === this.lowerCaseQueryAsSuggestion.VaultPathWithoutExtension
		if (queryIsForSameNoteAsSuggestion){
			this.suggestionForQueryAlreadyExist = true
			if (this.queryAsSuggestion.HasAlias){
				suggestion = new NoteSuggestion(`${suggestion.VaultPath}|${this.queryAsSuggestion.Alias}`)
			}
		}

		if (queryIsAncestor && queryCouldBeForSuggestedNote){
			this.validSuggestions.push(suggestion)
		}
	}

	getSortedSuggestions() : NoteSuggestion[]{
		this.validSuggestions.sort((a, b) => a.Title.localeCompare(b.Title))
		return this.validSuggestions
	}

	static for(query: string){
		return new NoteSuggestionCollection(query)
	}
}


export class NoteSuggestionCollector {
	private metadata: IMetadataCollection

	constructor(metadata: IMetadataCollection) {
		this.metadata = metadata
	}

	getSuggestions(query: string): NoteSuggestion[] {
		const suggestionCollection = NoteSuggestionCollection.for(query)
		const allLinks = [...new Set(this.getVaultPathsOfAllLinks())]
		for (let i = 0; i < allLinks.length; i++) {
			suggestionCollection.add(allLinks[i])
		}

		const suggestions = suggestionCollection.getSortedSuggestions()
		if(query === '' || suggestionCollection.suggestionForQueryAlreadyExist){
			return suggestions
		}

		suggestions.unshift(new NoteSuggestion(query))
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
