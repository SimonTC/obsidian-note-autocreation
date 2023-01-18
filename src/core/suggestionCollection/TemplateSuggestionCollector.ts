import {IConfigurationStore, IFileSystem} from "../../interop/ObsidianInterfaces"
import {NoteSuggestion} from "../suggestions/NoteSuggestion"
import {FileSuggestion} from "../suggestions/FileSuggestion"
import {TemplateSuggestion} from "../suggestions/TemplateSuggestion"
import {NoteAutoCreatorSettings} from "../../settings/NoteAutoCreatorSettings"
import {FileQuery} from "../queries/FileQuery"
import {Suggestion} from "../suggestions/ISuggestion"

export class TemplateSuggestionCollector {
	private readonly fileSystem: IFileSystem
	private readonly configStore: IConfigurationStore
	private readonly settings: NoteAutoCreatorSettings

	constructor(fileSystem: IFileSystem, configStore: IConfigurationStore, settings: NoteAutoCreatorSettings) {
		this.fileSystem = fileSystem
		this.configStore = configStore
		this.settings = settings
	}

	getSuggestions(templateQuery: string, noteSuggestion: NoteSuggestion): FileSuggestion[] {
		const query = FileQuery.forTemplateSuggestions(templateQuery)
		const templaterTemplateFolderPath = this.configStore.getTemplaterTemplatesPath()
		const validSuggestions: TemplateSuggestion[] = []
		const showDefaultFolderFirst = templateQuery === '' && this.settings.defaultTemplaterTemplate !== ''

		const pathToFilterOut = showDefaultFolderFirst ? this.settings.defaultTemplaterTemplate : ''
		for (const suggestion of this.getAllPossibleSuggestions(templaterTemplateFolderPath, noteSuggestion, pathToFilterOut)){
			const queryResult = query.couldBeQueryFor(suggestion)
			if (queryResult.isAtLeastPartialMatch){
				validSuggestions.push(suggestion)
			}
		}

		validSuggestions.sort(Suggestion.compare)
		if (showDefaultFolderFirst){
			const defaultTemplate = new TemplateSuggestion(this.settings.defaultTemplaterTemplate, noteSuggestion, templaterTemplateFolderPath)
			return [defaultTemplate, ...validSuggestions]
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
				.map(f => new TemplateSuggestion(f.path, noteSuggestion, templateFolderPath))
			: []
	}
}
