import {allTrue, anyTrue, MatchChecker, Query} from "./Query"
import {FolderSuggestion} from "../suggestions/FolderSuggestion"
import {IEditorSuggestContext} from "../../interop/ObsidianInterfaces"
import {NoteAutoCreatorSettings} from "../../settings/NoteAutoCreatorSettings"
import {ObsidianFolderPath} from "../paths/ObsidianFolderPath"

type FolderMatchChecker = MatchChecker<FolderSuggestion>

export class FolderQuery extends Query<FolderSuggestion>{
	constructor(context: IEditorSuggestContext, settings: NoteAutoCreatorSettings) {
		const query = context.query
		const lowerCaseQueryPath = new ObsidianFolderPath(query.toLowerCase())

		const fullMatchFoundChecker: FolderMatchChecker =
			(suggestion: FolderSuggestion) => suggestion.Path.VaultPath.toLowerCase() === lowerCaseQueryPath.VaultPath

		const partialMatchFoundChecker: FolderMatchChecker = allTrue([
			Query.topFolderCheck(lowerCaseQueryPath, context, settings),
			anyTrue([
				(suggestion: FolderSuggestion) => suggestion.Path.VaultPath.toLowerCase().includes(lowerCaseQueryPath.VaultPath)
			])
		])

		super(query, fullMatchFoundChecker, partialMatchFoundChecker)
	}
}
