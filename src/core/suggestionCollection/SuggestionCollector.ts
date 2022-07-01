import {IConfigurationStore, IFileSystem, IObsidianInterop} from "../../interop/ObsidianInterfaces"
import {ExistingNoteSuggestion, NewNoteSuggestion} from "../suggestions/NoteSuggestion"
import {NoteSuggestionCollector} from "./NoteSuggestionCollector"
import {TemplateSuggestionCollector} from "./TemplateSuggestionCollector"
import {NoteAutoCreatorSettings} from "../../settings/NoteAutoCreatorSettings"
import {HeaderSuggestionCollector} from "./HeaderSuggestionCollector"
import {ISuggestion} from "../suggestions/ISuggestion"

export class SuggestionCollector {
	private readonly noteSuggestionCollector: NoteSuggestionCollector
	private readonly templateSuggestionCollector: TemplateSuggestionCollector
	private readonly headerSuggestionCollector: HeaderSuggestionCollector
	private readonly fileSystem: IFileSystem
	private readonly settings: NoteAutoCreatorSettings
	private readonly configStore: IConfigurationStore

	constructor(interOp: IObsidianInterop, settings: NoteAutoCreatorSettings) {
		this.settings = settings
		this.noteSuggestionCollector = new NoteSuggestionCollector(interOp, settings)
		this.templateSuggestionCollector = new TemplateSuggestionCollector(interOp, interOp, settings)
		this.headerSuggestionCollector = new HeaderSuggestionCollector(interOp)
		this.fileSystem = interOp
		this.configStore = interOp
	}

	private getNoteSuggestionFor(query: string) {
		const tempSuggestion = new ExistingNoteSuggestion(query)
		return this.fileSystem.noteExists(tempSuggestion.VaultPath)
			? tempSuggestion
			: new NewNoteSuggestion(query)
	}

	getSuggestions(query: string): ISuggestion[] {
		if (this.configStore.templaterIsEnabled && query.includes(this.settings.templateTriggerSymbol)) {
			const [noteQuery, templateQuery] = query.split(this.settings.templateTriggerSymbol)
			const noteSuggestion = this.getNoteSuggestionFor(noteQuery)
			return this.templateSuggestionCollector.getSuggestions(templateQuery, noteSuggestion)
		}

		if (query.includes('#')){
			const [noteQuery, headerQuery] = query.split('#')
			const noteSuggestion = this.getNoteSuggestionFor(noteQuery)
			return this.headerSuggestionCollector.getSuggestions(headerQuery, noteSuggestion)
		}

		return this.noteSuggestionCollector.getSuggestions(query)
	}
}
