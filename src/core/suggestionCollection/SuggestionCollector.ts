import {IFileSystem, IObsidianInterop} from "../../interop/ObsidianInterfaces"
import {ExistingNoteSuggestion, NewNoteSuggestion} from "../suggestions/NoteSuggestion"
import {Suggestion} from "../suggestions/Suggestion"
import {NoteSuggestionCollector} from "./NoteSuggestionCollector"
import {TemplateSuggestionCollector} from "./TemplateSuggestionCollector"

export class SuggestionCollector {
	private readonly noteSuggestionCollector: NoteSuggestionCollector
	private readonly templateSuggestionCollector: TemplateSuggestionCollector
	private readonly fileSystem: IFileSystem

	constructor(interOp: IObsidianInterop) {
		this.noteSuggestionCollector = new NoteSuggestionCollector(interOp)
		this.templateSuggestionCollector = new TemplateSuggestionCollector(interOp)
		this.fileSystem = interOp
	}

	private getNoteSuggestionFor(query: string) {
		const tempSuggestion = new ExistingNoteSuggestion(query)
		return this.fileSystem.noteExists(tempSuggestion.VaultPath)
			? tempSuggestion
			: new NewNoteSuggestion(query)
	}

	getSuggestions(query: string): Suggestion[] {
		if (query.includes('$')) {
			const [noteQuery, templateQuery] = query.split('$')
			const noteSuggestion = this.getNoteSuggestionFor(noteQuery)
			return this.templateSuggestionCollector.getSuggestions(templateQuery, noteSuggestion)
		}

		return this.noteSuggestionCollector.getSuggestions(query)
	}
}
