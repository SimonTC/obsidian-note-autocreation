import {ISuggestion} from "../suggestions/ISuggestion"
import {QueryResult} from "./QueryResult"
import {ObsidianPath} from "../paths/ObsidianPath"
import {IEditorSuggestContext} from "../../interop/ObsidianInterfaces"
import {NoteAutoCreatorSettings} from "../../settings/NoteAutoCreatorSettings"
import {ObsidianFilePath} from "../paths/ObsidianFilePath"
import {ObsidianFolderPath} from "../paths/ObsidianFolderPath"

export type MatchChecker<TSuggestion extends ISuggestion> = (suggestion: TSuggestion) => boolean

export function allTrue<TSuggestion extends ISuggestion>(matchers: MatchChecker<TSuggestion>[]): MatchChecker<TSuggestion> {
	return (suggestion: TSuggestion) => matchers.every(m => m(suggestion))
}

export function anyTrue<TSuggestion extends ISuggestion>(matchers: MatchChecker<TSuggestion>[]): MatchChecker<TSuggestion> {
	return (suggestion: TSuggestion) => matchers.some(m => m(suggestion))
}

export class Query<TSuggestion extends ISuggestion> {
	private fullMatchFoundCheckers: MatchChecker<TSuggestion>[]
	private partialMatchFoundCheckers: MatchChecker<TSuggestion>[]
	readonly query: string

	protected constructor(query: string, fullMatchFoundCheckers: MatchChecker<TSuggestion>[], partialMatchFoundCheckers: MatchChecker<TSuggestion>[]) {
		this.fullMatchFoundCheckers = fullMatchFoundCheckers
		this.partialMatchFoundCheckers = partialMatchFoundCheckers
		this.query = query
	}

	couldBeQueryFor(suggestion: TSuggestion): QueryResult {
		if (this.fullMatchFoundCheckers.some(checker => checker(suggestion))) {
			return QueryResult.forCompleteMatch()
		}

		if (this.partialMatchFoundCheckers.some(checker => checker(suggestion))) {
			return QueryResult.forPartialMatch()
		}

		return QueryResult.forNoMatch()
	}

	get IsEmpty() {
		return this.query === ''
	}

	static topFolderCheck<TSuggestion extends ISuggestion>(queryPath: ObsidianPath, context: IEditorSuggestContext, settings: NoteAutoCreatorSettings): MatchChecker<TSuggestion> {
		if (settings.relativeTopFolders.length > 0) {
			const filePath = new ObsidianFilePath(context.file.path)
			const topFolderToUse = settings.relativeTopFolders.find(folder => {
				return folder.isAncestorOf(filePath) || filePath.FolderPath.VaultPath.toLowerCase().includes(folder.VaultPath)
			})
			if (topFolderToUse) {
				const endOfFolderPath = filePath.FolderPath.VaultPath.lastIndexOf(topFolderToUse.VaultPath)
				const folderPathToUse = filePath.FolderPath.VaultPath.slice(0, endOfFolderPath + topFolderToUse.VaultPath.length)
				const path = new ObsidianFolderPath(folderPathToUse)
				return (suggestion) => path.isAncestorOf(suggestion.Path)
			}
		}
		return (suggestion) => true
	}
}
