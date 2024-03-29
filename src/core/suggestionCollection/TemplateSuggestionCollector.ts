import {IConfigurationStore, IFileSystem} from "../../interop/ObsidianInterfaces"
import {NoteSuggestion} from "../suggestions/NoteSuggestion"
import {FileSuggestion} from "../suggestions/FileSuggestion"
import {TemplateSuggestion} from "../suggestions/TemplateSuggestion"
import {NoteAutoCreatorSettings} from "../../settings/NoteAutoCreatorSettings"
import {FileQuery} from "../queries/FileQuery"
import {Suggestion} from "../suggestions/ISuggestion"
import {ITemplateConfig} from "../templateApplication/ITemplateConfig"

export class TemplateSuggestionCollector {
	private readonly fileSystem: IFileSystem
	private readonly configStore: IConfigurationStore
	private readonly settings: NoteAutoCreatorSettings
	private readonly templateConfig: ITemplateConfig

	constructor(fileSystem: IFileSystem, configStore: IConfigurationStore, settings: NoteAutoCreatorSettings, templateConfig: ITemplateConfig) {
		this.fileSystem = fileSystem
		this.configStore = configStore
		this.settings = settings
		this.templateConfig = templateConfig
	}

	getSuggestions(templateQuery: string, noteSuggestion: NoteSuggestion): FileSuggestion[] {
		const query = FileQuery.forTemplateSuggestions(templateQuery)
		const templateFolderPath = this.templateConfig.getTemplateFolderPath()
		const validSuggestions: TemplateSuggestion[] = []
		const defaultTemplate = this.templateConfig.getDefaultTemplate()
		const showDefaultFolderFirst = templateQuery === '' && defaultTemplate !== ''

		const pathToFilterOut = showDefaultFolderFirst ? defaultTemplate : ''
		for (const suggestion of this.getAllPossibleSuggestions(templateFolderPath, noteSuggestion, pathToFilterOut)){
			const queryResult = query.couldBeQueryFor(suggestion)
			if (queryResult.isAtLeastPartialMatch){
				validSuggestions.push(suggestion)
			}
		}

		validSuggestions.sort(Suggestion.compare)
		if (showDefaultFolderFirst){
			const defaultTemplateSuggestion = new TemplateSuggestion(defaultTemplate, noteSuggestion, templateFolderPath, this.templateConfig)
			return [defaultTemplateSuggestion, ...validSuggestions]
		}
		return validSuggestions
	}
	private getAllPossibleSuggestions(
		templateFolderPath: string | undefined,
		noteSuggestion: NoteSuggestion,
		pathToFilterOut: string ): TemplateSuggestion[]
	{
		return templateFolderPath
			? this.fileSystem.getAllFileDescendantsOf(templateFolderPath)
				.filter(f => f.path.toLowerCase() !== pathToFilterOut)
				.map(f => new TemplateSuggestion(f.path, noteSuggestion, templateFolderPath, this.templateConfig))
			: []
	}
}

