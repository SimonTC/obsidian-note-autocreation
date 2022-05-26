import {IConfigurationStore, IFileSystem} from "../../interop/ObsidianInterfaces"
import {NoteSuggestion} from "../suggestions/NoteSuggestion"
import {Suggestion} from "../suggestions/Suggestion"
import {BaseSuggestionCollector} from "./BaseSuggestionCollector"
import {TemplateSuggestion} from "../suggestions/TemplateSuggestion"

export class TemplateSuggestionCollector {
	private readonly fileSystem: IFileSystem
	private readonly configStore: IConfigurationStore

	constructor(fileSystem: IFileSystem, configStore: IConfigurationStore) {
		this.fileSystem = fileSystem
		this.configStore = configStore
	}

	getSuggestions(templateQuery: string, noteSuggestion: NoteSuggestion): Suggestion[] {
		const templateFolderPath = this.configStore.getCoreTemplatesPath()
		if (!templateFolderPath){
			return []
		}
		const collector = new BaseSuggestionCollector({
			getAllPossibleLinks: () => this.getAllPossibleLinks(templateFolderPath),
			createSuggestion: query => new TemplateSuggestion(query, noteSuggestion, templateFolderPath),
			createSuggestionForQuery: query => new TemplateSuggestion(query, noteSuggestion, templateFolderPath),
			createSuggestionWhenSuggestionForQueryAlreadyExists: collection => collection.existingSuggestionForQuery
		})

		return collector.getSuggestions(templateQuery)
	}

	private getAllPossibleLinks(templateFolderPath: string | undefined) : Set<string>{
		return templateFolderPath
			? new Set(this.fileSystem.getAllFileDescendantsOf(templateFolderPath).map(f => f.path))
			: new Set<string>()
	}
}
