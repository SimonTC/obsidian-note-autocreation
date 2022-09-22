import {
	IConfigurationStore,
	IEditorSuggestContext,
	IFileSystem,
	IObsidianInterop
} from "../../interop/ObsidianInterfaces"
import {ExistingNoteSuggestion, NewNoteSuggestion} from "../suggestions/NoteSuggestion"
import {TemplateSuggestionCollector} from "./TemplateSuggestionCollector"
import {FolderSuggestionMode, NoteAutoCreatorSettings} from "../../settings/NoteAutoCreatorSettings"
import {HeaderSuggestionCollector} from "./HeaderSuggestionCollector"
import {ISuggestion} from "../suggestions/ISuggestion"
import {NotFoundSuggestion} from "../suggestions/NotFoundSuggestion"
import {
	FolderSuggestionCollector,
	NoteAndFolderSuggestionCollector,
	NoteSuggestionCollector
} from "./BaseSuggestionCollector"
import {NoteAndFolderQuery} from "../queries/NoteAndFolderQuery"
import {FileQuery} from "../queries/FileQuery"
import {FolderQuery} from "../queries/FolderQuery"

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
			suggestions = this.getTemplateSuggestions(query)
		} else if (query.includes('#')){
			suggestions = this.getHeaderSuggestions(query)
		} else if (this.settings.includeFoldersInSuggestions){
			suggestions = this.getFoldersOrCombinedSuggestions(query, context)
		} else {
			suggestions = this.getNoteSuggestions(context)
		}

		return suggestions.length > 0 ? suggestions : [new NotFoundSuggestion(query, 'No match found')]
	}

	private getNoteSuggestions(context: IEditorSuggestContext) {
		return this.noteSuggestionCollector.getSuggestions(FileQuery.forNoteSuggestions(context, this.settings))
	}

	private getFoldersOrCombinedSuggestions(query: string, context: IEditorSuggestContext) {
		const onlyCollectFoldersOnTrigger = this.settings.folderSuggestionSettings.folderSuggestionMode === FolderSuggestionMode.OnTrigger
		if (onlyCollectFoldersOnTrigger) {
			return this.getOnlyFolderOrNoteSuggestions(query, context)
		} else {
			return this.getFolderAndNoteSuggestions(context)
		}
	}

	private getFolderAndNoteSuggestions(context: IEditorSuggestContext) {
		return this.combinedSuggestionCollector.getSuggestions(new NoteAndFolderQuery(context, this.settings))
	}

	private getOnlyFolderOrNoteSuggestions(query: string, context: IEditorSuggestContext) {
		const trigger = this.settings.folderSuggestionSettings.folderSuggestionTrigger
		if (this.queryStartsWithTrigger(query, trigger)) {
			context.query = context.query.substring(trigger.length)
			return this.getFolderSuggestions(context)
		} else {
			return this.getNoteSuggestions(context)
		}
	}

	private getFolderSuggestions(context: IEditorSuggestContext) {
		return this.folderSuggestionCollector.getSuggestions(new FolderQuery(context, this.settings))
	}

	private queryStartsWithTrigger(query: string, trigger: string) {
		return query.toLowerCase().startsWith(trigger.toLowerCase())
	}

	private getHeaderSuggestions(query: string) {
		const [noteQuery, headerQuery] = query.split('#')
		const noteSuggestion = this.getNoteSuggestionFor(noteQuery)
		if (noteSuggestion instanceof ExistingNoteSuggestion) {
			return this.headerSuggestionCollector.getSuggestions(headerQuery, noteSuggestion)
		} else {
			return [new NotFoundSuggestion(query, 'No headers to link to in non-existing notes')]
		}
	}

	private getTemplateSuggestions(query: string) {
		const [noteQuery, templateQuery] = query.split(this.settings.templateTriggerSymbol)
		const noteSuggestion = this.getNoteSuggestionFor(noteQuery)
		return this.templateSuggestionCollector.getSuggestions(templateQuery, noteSuggestion)
	}
}
