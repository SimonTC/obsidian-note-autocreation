import {IConfigurationStore, IFileSystem, IObsidianInterop} from "../../interop/ObsidianInterfaces"
import {ExistingNoteSuggestion, NewNoteSuggestion} from "../suggestions/NoteSuggestion"
import {Suggestion} from "../suggestions/Suggestion"
import {NoteSuggestionCollector} from "./NoteSuggestionCollector"
import {TemplateSuggestionCollector} from "./TemplateSuggestionCollector"
import {NoteAutoCreatorSettings} from "../../settings/NoteAutoCreatorSettings"

export class SuggestionCollector {
	private readonly noteSuggestionCollector: NoteSuggestionCollector
	private readonly templateSuggestionCollector: TemplateSuggestionCollector
	private readonly fileSystem: IFileSystem
	private readonly settings: NoteAutoCreatorSettings
	private readonly configStore: IConfigurationStore

	constructor(interOp: IObsidianInterop, settings: NoteAutoCreatorSettings) {
		this.settings = settings
		this.noteSuggestionCollector = new NoteSuggestionCollector(interOp)
		this.templateSuggestionCollector = new TemplateSuggestionCollector(interOp, interOp)
		this.fileSystem = interOp
		this.configStore = interOp
	}

	private getNoteSuggestionFor(query: string) {
		const tempSuggestion = new ExistingNoteSuggestion(query)
		return this.fileSystem.noteExists(tempSuggestion.VaultPath)
			? tempSuggestion
			: new NewNoteSuggestion(query)
	}

	getSuggestions(query: string): Suggestion[] {
		if (this.configStore.templaterIsEnabled && query.includes(this.settings.templateTriggerSymbol)) {
			const [noteQuery, templateQuery] = query.split(this.settings.templateTriggerSymbol)
			const noteSuggestion = this.getNoteSuggestionFor(noteQuery)
			return this.templateSuggestionCollector.getSuggestions(templateQuery, noteSuggestion)
		}

		return this.noteSuggestionCollector.getSuggestions(query)
	}
}
