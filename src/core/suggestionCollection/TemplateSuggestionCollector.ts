import {IConfigurationStore, IFileSystem} from "../../interop/ObsidianInterfaces"
import {NoteSuggestion} from "../suggestions/NoteSuggestion"
import {Suggestion} from "../suggestions/Suggestion"
import {BaseSuggestionCollector, VaultPathInfo} from "./BaseSuggestionCollector"
import {TemplateSuggestion} from "../suggestions/TemplateSuggestion"
import {TFile} from "obsidian"
import {NoteAutoCreatorSettings} from "../../settings/NoteAutoCreatorSettings"

export class TemplateSuggestionCollector {
	private readonly fileSystem: IFileSystem
	private readonly configStore: IConfigurationStore
	private readonly settings: NoteAutoCreatorSettings

	constructor(fileSystem: IFileSystem, configStore: IConfigurationStore, settings: NoteAutoCreatorSettings) {
		this.fileSystem = fileSystem
		this.configStore = configStore
		this.settings = settings
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
		const templaterTemplateFolderPath = this.configStore.getTemplaterTemplatesPath()
		const templateCollectors = []

		// The order of adding template collectors is important
		// since if a suggestion already exist it will not be added when found a second time.
		if (templaterTemplateFolderPath) {
			console.debug('NAC: using templates from templater', templaterTemplateFolderPath)
			templateCollectors.push(this.createTemplateCollector(templaterTemplateFolderPath, noteSuggestion))
		}

		return templateCollectors
	}

	private createTemplateCollector(templateFolderPath: string, noteSuggestion: NoteSuggestion): BaseSuggestionCollector<TemplateSuggestion> {
		return new BaseSuggestionCollector({
			getAllPossibleVaultPaths: () => this.getAllPossibleLinks(templateFolderPath),
			createSuggestion: query => new TemplateSuggestion(query.path, noteSuggestion, templateFolderPath),
			createSuggestionWhenSuggestionForQueryAlreadyExists: collection => collection.existingSuggestionForQuery
		}, false, this.settings)
	}

	private getAllPossibleLinks(templateFolderPath: string | undefined) : Set<VaultPathInfo>{
		const toVaultPathInfo = (f: TFile): VaultPathInfo => { return {path: f.path, pathIsToExistingNote: true, alias: undefined} }
		return templateFolderPath
			? new Set(this.fileSystem.getAllFileDescendantsOf(templateFolderPath).map(toVaultPathInfo))
			: new Set<VaultPathInfo>()
	}
}
