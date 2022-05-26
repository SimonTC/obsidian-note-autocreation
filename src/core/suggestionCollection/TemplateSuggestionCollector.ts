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

		const suggestions: Suggestion[] = []
		const observedSuggestions = new Set<string>()
		for (const templateCollector of templateCollectors) {
			templateCollector.getSuggestions(templateQuery).forEach(su => {
				if (!observedSuggestions.has(su.VaultPath)){
					observedSuggestions.add(su.VaultPath)
					suggestions.push(su)
				}
			})
		}

		suggestions.sort(Suggestion.compare)
		return suggestions
	}

	private createCollectors(noteSuggestion: NoteSuggestion) {
		const coreTemplateFolderPath = this.configStore.getCoreTemplatesPath()
		const templaterTemplateFolderPath = this.configStore.getTemplaterTemplatesPath()
		const templateCollectors = []

		// The order of adding template collectors is important
		// since if a suggestion already exist it will not be added when found a second time.
		if (templaterTemplateFolderPath) {
			console.debug('NAC: using templates from templater', templaterTemplateFolderPath)
			templateCollectors.push(this.createTemplateCollector(templaterTemplateFolderPath, noteSuggestion))
		}

		if (coreTemplateFolderPath) {
			console.debug('NAC: using templates from core templates', coreTemplateFolderPath)
			templateCollectors.push(this.createTemplateCollector(coreTemplateFolderPath, noteSuggestion))
		}
		return templateCollectors
	}

	private createTemplateCollector(templateFolderPath: string, noteSuggestion: NoteSuggestion): BaseSuggestionCollector<TemplateSuggestion> {
		return new BaseSuggestionCollector({
			getAllPossibleLinks: () => this.getAllPossibleLinks(templateFolderPath),
			createSuggestion: query => new TemplateSuggestion(query, noteSuggestion, templateFolderPath),
			createSuggestionForQuery: query => new TemplateSuggestion(query, noteSuggestion, templateFolderPath),
			createSuggestionWhenSuggestionForQueryAlreadyExists: collection => collection.existingSuggestionForQuery
		}, false)
	}

	private getAllPossibleLinks(templateFolderPath: string | undefined) : Set<string>{
		return templateFolderPath
			? new Set(this.fileSystem.getAllFileDescendantsOf(templateFolderPath).map(f => f.path))
			: new Set<string>()
	}
}
