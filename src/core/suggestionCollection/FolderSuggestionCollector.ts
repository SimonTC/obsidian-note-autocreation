import {IFileSystem} from "../../interop/ObsidianInterfaces"
import {FolderSuggestion} from "../suggestions/FolderSuggestion"
import {FolderQuery} from "../queries/FolderQuery"
import {Suggestion} from "../suggestions/ISuggestion"
import {ObsidianFolderPath} from "../paths/ObsidianFolderPath"

export class FolderSuggestionCollector {
	private readonly fileSystem: IFileSystem

	constructor(fileSystem: IFileSystem) {
		this.fileSystem = fileSystem
	}

	getSuggestions(query: FolderQuery): FolderSuggestion []{

		let existingSuggestionForQuery: FolderSuggestion
		const validSuggestions: FolderSuggestion[] = []

		for (const suggestion of this.fileSystem.getPathsToAllLoadedFolders().map(FolderSuggestion.FromPath)){
			const queryResult = query.couldBeQueryFor(suggestion)

			if (queryResult.isCompleteMatch){
				existingSuggestionForQuery = suggestion
				continue
			}

			if (queryResult.isAtLeastPartialMatch){
				validSuggestions.push(suggestion)
			}
		}

		validSuggestions.sort(Suggestion.compare)

		if (query.IsEmpty) {
			return validSuggestions
		}

		if (existingSuggestionForQuery){
			validSuggestions.unshift(existingSuggestionForQuery)
		} else {
			validSuggestions.unshift(new FolderSuggestion(new ObsidianFolderPath(query.query)))
		}

		return validSuggestions
	}
}
