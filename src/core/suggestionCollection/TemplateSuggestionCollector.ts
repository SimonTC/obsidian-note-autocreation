import {IFileSystem} from "../../interop/ObsidianInterfaces"
import {NoteSuggestion} from "../suggestions/NoteSuggestion"
import {Suggestion} from "../suggestions/Suggestion"
import {BaseSuggestionCollector} from "./BaseSuggestionCollector"
import {TemplateSuggestion} from "../suggestions/TemplateSuggestion"

export class TemplateSuggestionCollector {
	private readonly fileSystem: IFileSystem
	private readonly templateFolderPath = '_templates'

	constructor(fileSystem: IFileSystem) {
		this.fileSystem = fileSystem
	}

	getSuggestions(templateQuery: string, noteSuggestion: NoteSuggestion): Suggestion[] {
		const collector = new BaseSuggestionCollector({
			getAllPossibleLinks: () => new Set(this.fileSystem.getAllFileDescendantsOf(this.templateFolderPath).map(f => f.path)),
			createSuggestion: query => new TemplateSuggestion(query, noteSuggestion, this.templateFolderPath),
			createSuggestionForQuery: query => new TemplateSuggestion(query, noteSuggestion, this.templateFolderPath),
			createSuggestionWhenSuggestionForQueryAlreadyExists: collection => collection.existingSuggestionForQuery
		})

		return collector.getSuggestions(templateQuery)
	}
}
