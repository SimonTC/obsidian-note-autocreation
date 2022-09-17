import {
	IConfigurationStore,
	IEditorSuggestContext,
	IFileSystem,
	IObsidianInterop
} from "../../interop/ObsidianInterfaces"
import {ExistingNoteSuggestion, NewNoteSuggestion} from "../suggestions/NoteSuggestion"
import {TemplateSuggestionCollector} from "./TemplateSuggestionCollector"
import {NoteAutoCreatorSettings} from "../../settings/NoteAutoCreatorSettings"
import {HeaderSuggestionCollector} from "./HeaderSuggestionCollector"
import {ISuggestion} from "../suggestions/ISuggestion"
import {NotFoundSuggestion} from "../suggestions/NotFoundSuggestion"
import {
	FolderSuggestionCollector,
	NoteAndFolderSuggestionCollector,
	NoteSuggestionCollector
} from "./BaseSuggestionCollector"
import {NoteAndFolderQuery} from "../queries/NoteAndFolderQuery"

export class SuggestionCollector {
	private readonly noteSuggestionCollector: NoteSuggestionCollector
	private readonly folderSuggestionCollector: FolderSuggestionCollector
	private readonly templateSuggestionCollector: TemplateSuggestionCollector
	private readonly headerSuggestionCollector: HeaderSuggestionCollector
	private readonly combinedSuggestionCollector: NoteAndFolderSuggestionCollector
	private readonly fileSystem: IFileSystem
	private readonly settings: NoteAutoCreatorSettings
	private readonly configStore: IConfigurationStore

	constructor(interOp: IObsidianInterop, settings: NoteAutoCreatorSettings) {
		this.settings = settings
		this.noteSuggestionCollector = new NoteSuggestionCollector(interOp, settings)
		this.templateSuggestionCollector = new TemplateSuggestionCollector(interOp, interOp, settings)
		this.headerSuggestionCollector = new HeaderSuggestionCollector(interOp)
		this.folderSuggestionCollector = new FolderSuggestionCollector(interOp)
		this.combinedSuggestionCollector = new NoteAndFolderSuggestionCollector(interOp, settings)
		this.fileSystem = interOp
		this.configStore = interOp
	}

	private getNoteSuggestionFor(query: string): NewNoteSuggestion | ExistingNoteSuggestion {
		const tempSuggestion = new ExistingNoteSuggestion(query)
		return this.fileSystem.noteExists(tempSuggestion.VaultPath)
			? tempSuggestion
			: new NewNoteSuggestion(query)
	}

	getSuggestions(context: IEditorSuggestContext): ISuggestion[] {
		const query = context.query
		let suggestions: ISuggestion[] = []
		if (this.configStore.templaterIsEnabled && query.includes(this.settings.templateTriggerSymbol)) {
			const [noteQuery, templateQuery] = query.split(this.settings.templateTriggerSymbol)
			const noteSuggestion = this.getNoteSuggestionFor(noteQuery)
			suggestions = this.templateSuggestionCollector.getSuggestions(templateQuery, noteSuggestion)
		} else if (query.includes('#')){
			const [noteQuery, headerQuery] = query.split('#')
			const noteSuggestion = this.getNoteSuggestionFor(noteQuery)
			if (noteSuggestion instanceof ExistingNoteSuggestion){
				suggestions = this.headerSuggestionCollector.getSuggestions(headerQuery, noteSuggestion)
			} else {
				suggestions = [new NotFoundSuggestion(query, 'No headers to link to in non-existing notes')]
			}
		} else{
			suggestions = this.combinedSuggestionCollector.getSuggestions(new NoteAndFolderQuery(context, this.settings))
		}

		return suggestions.length > 0 ? suggestions : [new NotFoundSuggestion(query, 'No match found')]
	}
}
