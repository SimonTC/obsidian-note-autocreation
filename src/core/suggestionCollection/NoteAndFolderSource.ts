import {ISuggestionSource} from "./ISuggestionSource"
import {ISuggestion} from "../suggestions/ISuggestion"
import {Query} from "../queries/Query"
import {IObsidianInterop} from "../../interop/ObsidianInterfaces"
import {NoteAutoCreatorSettings} from "../../settings/NoteAutoCreatorSettings"
import {NoteSource} from "./NoteSource"
import {FolderSource} from "./FolderSource"
import {NoteSuggestion} from "../suggestions/NoteSuggestion"
import {FolderSuggestion} from "../suggestions/FolderSuggestion"

export class NoteAndFolderSource implements ISuggestionSource<ISuggestion>{

	private readonly noteSource: NoteSource
	private readonly folderSource: FolderSource

	private sources: ISuggestionSource<ISuggestion>[]

	constructor(interop: IObsidianInterop, settings: NoteAutoCreatorSettings) {
		this.noteSource = new NoteSource(interop, settings)
		this.folderSource = new FolderSource(interop)
		this.sources =[
			this.noteSource,
			this.folderSource
		]
	}

	createSuggestionFromQuery(query: Query<ISuggestion>, existingSuggestionForQuery: undefined | ISuggestion): ISuggestion {
		if (existingSuggestionForQuery && existingSuggestionForQuery instanceof FolderSuggestion){
			return this.folderSource.createSuggestionFromQuery(query, existingSuggestionForQuery)
		}

		return this.noteSource.createSuggestionFromQuery(query, <NoteSuggestion>existingSuggestionForQuery)
	}

	getAllPossibleSuggestions(query: string): ISuggestion[] {
		return this.sources.flatMap(s => s.getAllPossibleSuggestions(query))
	}
}
