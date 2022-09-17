import {Query} from "./Query"
import {ISuggestion} from "../suggestions/ISuggestion"
import {IEditorSuggestContext} from "../../interop/ObsidianInterfaces"
import {NoteAutoCreatorSettings} from "../../settings/NoteAutoCreatorSettings"
import {FileQuery} from "./FileQuery"
import {FolderQuery} from "./FolderQuery"

export class NoteAndFolderQuery extends Query<ISuggestion>{
	constructor(context: IEditorSuggestContext, settings: NoteAutoCreatorSettings) {
		const noteQuery = FileQuery.forNoteSuggestions(context, settings)
		const folderQuery = new FolderQuery(context, settings)

		super(
			context.query,
			[noteQuery.fullMatchFoundChecker, folderQuery.fullMatchFoundChecker],
			[noteQuery.partialMatchFoundChecker, folderQuery.partialMatchFoundChecker]
		)
	}
}
