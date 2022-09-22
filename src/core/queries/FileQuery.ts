import {FileSuggestion} from "../suggestions/FileSuggestion"
import {AliasNoteSuggestion} from "../suggestions/NoteSuggestion"
import {ObsidianFilePath} from "../paths/ObsidianFilePath"
import {NoteAutoCreatorSettings} from "../../settings/NoteAutoCreatorSettings"
import {IEditorSuggestContext} from "../../interop/ObsidianInterfaces"
import {allTrue, anyTrue, MatchChecker, Query} from "./Query"

type FileMatchChecker = MatchChecker<FileSuggestion>

export function getMatcherForExactMatch (lowerCaseQueryPath: ObsidianFilePath): FileMatchChecker{
	return (suggestion: FileSuggestion) => suggestion.Path.VaultPathWithoutExtension.toLowerCase() === lowerCaseQueryPath.VaultPathWithoutExtension
}

export function getMatcherForPartialMatch(lowerCaseQueryPath: ObsidianFilePath): FileMatchChecker{
	return (suggestion: FileSuggestion) => {
		const path = suggestion.Path
		const queryIsAncestor = path.FolderPath.VaultPath.toLowerCase().includes(lowerCaseQueryPath.FolderPath.VaultPath)
		const queryCouldBeForSuggestedNote = path.VaultPath.toLowerCase()
			.replace(lowerCaseQueryPath.FolderPath.VaultPath, '')
			.includes(lowerCaseQueryPath.Title)
		return queryIsAncestor && queryCouldBeForSuggestedNote
	}
}

export class FileQuery extends Query<FileSuggestion>{
	private constructor(query: string, fullMatchFoundCheckers: FileMatchChecker, partialMatchFoundCheckers: FileMatchChecker) {
		super(query, fullMatchFoundCheckers, partialMatchFoundCheckers)
	}

	private static aliasCheck(queryPath: ObsidianFilePath) : FileMatchChecker {
		return suggestion => {
			if (suggestion instanceof AliasNoteSuggestion){
				return suggestion.Alias.toLowerCase().includes(queryPath.Title)
			}
			return false
		}
	}

	static forNoteSuggestions(context: IEditorSuggestContext, settings: NoteAutoCreatorSettings): FileQuery{
		const query = context.query
		const lowerCaseQueryPath = new ObsidianFilePath(query.toLowerCase())

		const fullMatchFoundChecker = getMatcherForExactMatch(lowerCaseQueryPath)

		const partialMatchFoundChecker = allTrue([
			Query.topFolderCheck(lowerCaseQueryPath, context, settings),
			anyTrue([
				getMatcherForPartialMatch(lowerCaseQueryPath),
				this.aliasCheck(lowerCaseQueryPath)
			])
		])

		return new FileQuery(query, fullMatchFoundChecker, partialMatchFoundChecker)
	}

	static forTemplateSuggestions(query: string): FileQuery{
		const lowerCaseQueryPath = new ObsidianFilePath(query.toLowerCase())

		const fullMatchFoundChecker = getMatcherForExactMatch(lowerCaseQueryPath)

		const partialMatchFoundChecker = getMatcherForPartialMatch(lowerCaseQueryPath)

		return new FileQuery(query, fullMatchFoundChecker, partialMatchFoundChecker)
	}
}

