import {allTrue, anyTrue, MatchChecker, Query} from "./Query"
import {ISuggestion} from "../suggestions/ISuggestion"
import {IEditorSuggestContext} from "../../interop/ObsidianInterfaces"
import {NoteAutoCreatorSettings} from "../../settings/NoteAutoCreatorSettings"
import {FileQuery} from "./FileQuery"
import {FolderQuery} from "./FolderQuery"
import {NoteSuggestion} from "../suggestions/NoteSuggestion"
import {FolderSuggestion} from "../suggestions/FolderSuggestion"

export class NoteAndFolderQuery extends Query<ISuggestion>{
	constructor(context: IEditorSuggestContext, settings: NoteAutoCreatorSettings) {
		const noteQuery = FileQuery.forNoteSuggestions(context, settings)
		const folderQuery = new FolderQuery(context, settings)

		const fullMatchFoundCheckers: MatchChecker<ISuggestion>[] = [
			allTrue([NoteAndFolderQuery.isNoteSuggestion, noteQuery.fullMatchFoundChecker]),
			allTrue([NoteAndFolderQuery.isFolderSuggestion,folderQuery.fullMatchFoundChecker])
		]

		const partialMatchFoundCheckers: MatchChecker<ISuggestion>[] = [
			allTrue([NoteAndFolderQuery.isNoteSuggestion, noteQuery.partialMatchFoundChecker]),
			allTrue([NoteAndFolderQuery.isFolderSuggestion,folderQuery.partialMatchFoundChecker])
		]

		super( context.query, anyTrue(fullMatchFoundCheckers), anyTrue(partialMatchFoundCheckers) )
	}

	static isNoteSuggestion: MatchChecker<ISuggestion> = (suggestion: ISuggestion) => suggestion instanceof NoteSuggestion

	static isFolderSuggestion: MatchChecker<ISuggestion> = (suggestion: ISuggestion) => suggestion instanceof FolderSuggestion
}
