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
		const templateCollectors = this.createCollectors(noteSuggestion) // Recreating the collectors to make sure we capture any changes in template folder paths.

		return templateCollectors.flatMap(collector => collector.getSuggestions(templateQuery))
	}

	private createCollectors(noteSuggestion: NoteSuggestion) {
		const coreTemplateFolderPath = this.configStore.getCoreTemplatesPath()
		const templaterTemplateFolderPath = this.configStore.getTemplaterTemplatesPath()
		const templateCollectors = []
		if (coreTemplateFolderPath) {
			console.debug('NAC: using templates from core templates', coreTemplateFolderPath)
			templateCollectors.push(this.createTemplateCollector(coreTemplateFolderPath, noteSuggestion))
		}

		if (templaterTemplateFolderPath) {
			console.debug('NAC: using templates from templater', templaterTemplateFolderPath)
			templateCollectors.push(this.createTemplateCollector(templaterTemplateFolderPath, noteSuggestion))
		}
		return templateCollectors
	}

	private createTemplateCollector(templateFolderPath: string, noteSuggestion: NoteSuggestion) {
		return new BaseSuggestionCollector({
			getAllPossibleLinks: () => this.getAllPossibleLinks(templateFolderPath),
			createSuggestion: query => new TemplateSuggestion(query, noteSuggestion, templateFolderPath),
			createSuggestionForQuery: query => new TemplateSuggestion(query, noteSuggestion, templateFolderPath),
			createSuggestionWhenSuggestionForQueryAlreadyExists: collection => collection.existingSuggestionForQuery
		})
	}

	private getAllPossibleLinks(templateFolderPath: string | undefined) : Set<string>{
		return templateFolderPath
			? new Set(this.fileSystem.getAllFileDescendantsOf(templateFolderPath).map(f => f.path))
			: new Set<string>()
	}
}
