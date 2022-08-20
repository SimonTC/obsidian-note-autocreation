import {FileSuggestion} from "../suggestions/FileSuggestion"
import {AliasNoteSuggestion} from "../suggestions/NoteSuggestion"
import {ObsidianFilePath} from "../paths/ObsidianFilePath"
import {NoteAutoCreatorSettings} from "../../settings/NoteAutoCreatorSettings"
import {IEditorSuggestContext} from "../../interop/ObsidianInterfaces"
import {ObsidianFolderPath} from "../paths/ObsidianFolderPath"

type MatchChecker = (suggestion: FileSuggestion) => boolean

function getMatcherForExactMatch (lowerCaseQueryPath: ObsidianFilePath): MatchChecker{
	return (suggestion: FileSuggestion) => suggestion.Path.VaultPathWithoutExtension.toLowerCase() === lowerCaseQueryPath.VaultPathWithoutExtension
}

function getMatcherForPartialMatch(lowerCaseQueryPath: ObsidianFilePath): MatchChecker{
	return (suggestion: FileSuggestion) => {
		const path = suggestion.Path
		const queryIsAncestor = path.FolderPath.VaultPath.toLowerCase().includes(lowerCaseQueryPath.FolderPath.VaultPath)
		const queryCouldBeForSuggestedNote = path.VaultPath.toLowerCase()
			.replace(lowerCaseQueryPath.FolderPath.VaultPath, '')
			.includes(lowerCaseQueryPath.Title)
		return queryIsAncestor && queryCouldBeForSuggestedNote
	}
}

function allTrue(matchers: MatchChecker[]): MatchChecker{
	return (suggestion: FileSuggestion) => matchers.every(m => m(suggestion))
}

function anyTrue(matchers: MatchChecker[]): MatchChecker{
	return (suggestion: FileSuggestion) => matchers.some(m => m(suggestion))
}

export class Query{
	private fullMatchFoundCheckers: MatchChecker[]
	private partialMatchFoundCheckers: MatchChecker[]
	readonly query: string

	constructor(query: string, fullMatchFoundCheckers: MatchChecker[], partialMatchFoundCheckers: MatchChecker[]) {
		this.fullMatchFoundCheckers = fullMatchFoundCheckers
		this.partialMatchFoundCheckers = partialMatchFoundCheckers
		this.query = query
	}

	couldBeQueryFor(suggestion: FileSuggestion): FileQueryResult{
		if (this.fullMatchFoundCheckers.some(checker => checker(suggestion))){
			return FileQueryResult.forCompleteMatch()
		}

		if (this.partialMatchFoundCheckers.some(checker => checker(suggestion))){
			return FileQueryResult.forPartialMatch()
		}

		return FileQueryResult.forNoMatch()
	}

	get IsEmpty(){
		return this.query === ''
	}

	static topFolderCheck (queryPath: ObsidianFilePath, context:IEditorSuggestContext, settings: NoteAutoCreatorSettings): MatchChecker{
		if (settings.relativeTopFolders.length > 0){
			const filePath = new ObsidianFilePath(context.file.path)
			const topFolderToUse = settings.relativeTopFolders.find(folder => {
				return folder.isAncestorOf(filePath) ||  filePath.FolderPath.VaultPath.toLowerCase().includes(folder.VaultPath)
			})
			if (topFolderToUse){
				const endOfFolderPath = filePath.FolderPath.VaultPath.lastIndexOf(topFolderToUse.VaultPath)
				const folderPathToUse = filePath.FolderPath.VaultPath.slice(0, endOfFolderPath + topFolderToUse.VaultPath.length)
				const path = new ObsidianFolderPath(folderPathToUse)
				return (suggestion) => path.isAncestorOf(suggestion.Path)
			}
		}
		return (suggestion) => true
	}

	static suggestionCheck(queryPath: ObsidianFilePath) : MatchChecker {
		return suggestion => {
			if (suggestion instanceof AliasNoteSuggestion){
				return suggestion.Alias.toLowerCase().includes(queryPath.Title)
			}
			return false
		}
	}

	static forNoteSuggestions(context: IEditorSuggestContext, settings: NoteAutoCreatorSettings): Query{
		const query = context.query
		const lowerCaseQueryPath = new ObsidianFilePath(query.toLowerCase())

		const fullMatchFoundCheckers: MatchChecker[] = [
			getMatcherForExactMatch(lowerCaseQueryPath)
		]

		const partialMatchFoundCheckers: MatchChecker = allTrue([
			this.topFolderCheck(lowerCaseQueryPath, context, settings),
			anyTrue([
				getMatcherForPartialMatch(lowerCaseQueryPath),
				this.suggestionCheck(lowerCaseQueryPath)
			])
		])

		return new Query(query, fullMatchFoundCheckers, [partialMatchFoundCheckers])
	}

	static forTemplateSuggestions(query: string): Query{
		const lowerCaseQueryPath = new ObsidianFilePath(query.toLowerCase())

		const fullMatchFoundCheckers: MatchChecker[] = [
			getMatcherForExactMatch(lowerCaseQueryPath)
		]

		const partialMatchFoundCheckers: MatchChecker[] = [
			getMatcherForPartialMatch(lowerCaseQueryPath),
		]

		return new Query(query, fullMatchFoundCheckers, partialMatchFoundCheckers)
	}
}

export class FileQueryResult{
	isCompleteMatch: boolean
	isAtLeastPartialMatch: boolean
	isNoMatch: boolean

	private constructor(isAtLeastPartialMatch: boolean, isCompleteMatch: boolean) {
		this.isCompleteMatch = isCompleteMatch
		this.isAtLeastPartialMatch = isAtLeastPartialMatch
		this.isNoMatch = !(isCompleteMatch || isAtLeastPartialMatch)
	}

	static forCompleteMatch(): FileQueryResult{
		return new FileQueryResult(true, true)
	}

	static forPartialMatch(): FileQueryResult{
		return new FileQueryResult(true, false)
	}

	static forNoMatch(): FileQueryResult{
		return new FileQueryResult(false, false)
	}
}
