import {IConfigurationStore, IFileSystem} from "../../interop/ObsidianInterfaces"
import {NoteSuggestion} from "../suggestions/NoteSuggestion"
import {FileSuggestion} from "../suggestions/FileSuggestion"
import {TemplateSuggestion} from "../suggestions/TemplateSuggestion"
import {NoteAutoCreatorSettings} from "../../settings/NoteAutoCreatorSettings"
import {Query} from "../queries/FileQuery"

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
		const query = Query.forTemplateSuggestions(templateQuery)
		const templaterTemplateFolderPath = this.configStore.getTemplaterTemplatesPath()
		const validSuggestions: TemplateSuggestion[] = []

		for (const suggestion of this.getAllPossibleSuggestions(templaterTemplateFolderPath, noteSuggestion)){
			const queryResult = query.couldBeQueryFor(suggestion)
			if (queryResult.isAtLeastPartialMatch){
				validSuggestions.push(suggestion)
			}
		}

		validSuggestions.sort(FileSuggestion.compare)
		return validSuggestions
	}

	private getAllPossibleSuggestions(templateFolderPath: string | undefined, noteSuggestion: NoteSuggestion ): TemplateSuggestion[]{
		return templateFolderPath
			? this.fileSystem.getAllFileDescendantsOf(templateFolderPath).map(f => new TemplateSuggestion(f.path, noteSuggestion, templateFolderPath))
			: []
	}
}
