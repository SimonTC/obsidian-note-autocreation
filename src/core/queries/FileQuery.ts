import {FileSuggestion} from "../suggestions/FileSuggestion"
import {AliasNoteSuggestion} from "../suggestions/NoteSuggestion"
import {ObsidianFilePath} from "../paths/ObsidianFilePath"
import {NoteAutoCreatorSettings} from "../../settings/NoteAutoCreatorSettings"
import {IEditorSuggestContext} from "../../interop/ObsidianInterfaces"
import {ObsidianFolderPath} from "../paths/ObsidianFolderPath"
import {ISuggestion} from "../suggestions/ISuggestion"
import {ObsidianPath} from "../paths/ObsidianPath"

type MatchChecker<TSuggestion extends ISuggestion>  = (suggestion: TSuggestion) => boolean

type FileMatchChecker = MatchChecker<FileSuggestion>

function getMatcherForExactMatch (lowerCaseQueryPath: ObsidianFilePath): FileMatchChecker{
	return (suggestion: FileSuggestion) => suggestion.Path.VaultPathWithoutExtension.toLowerCase() === lowerCaseQueryPath.VaultPathWithoutExtension
}

function getMatcherForPartialMatch(lowerCaseQueryPath: ObsidianFilePath): FileMatchChecker{
	return (suggestion: FileSuggestion) => {
		const path = suggestion.Path
		const queryIsAncestor = path.FolderPath.VaultPath.toLowerCase().includes(lowerCaseQueryPath.FolderPath.VaultPath)
		const queryCouldBeForSuggestedNote = path.VaultPath.toLowerCase()
			.replace(lowerCaseQueryPath.FolderPath.VaultPath, '')
			.includes(lowerCaseQueryPath.Title)
		return queryIsAncestor && queryCouldBeForSuggestedNote
	}
}

function allTrue(matchers: FileMatchChecker[]): FileMatchChecker{
	return (suggestion: FileSuggestion) => matchers.every(m => m(suggestion))
}

function anyTrue(matchers: FileMatchChecker[]): FileMatchChecker{
	return (suggestion: FileSuggestion) => matchers.some(m => m(suggestion))
}

export class Query<TSuggestion extends ISuggestion>{
	private fullMatchFoundCheckers: MatchChecker<TSuggestion>[]
	private partialMatchFoundCheckers: MatchChecker<TSuggestion>[]
	readonly query: string

	protected constructor(query: string, fullMatchFoundCheckers: MatchChecker<TSuggestion>[], partialMatchFoundCheckers: MatchChecker<TSuggestion>[]) {
		this.fullMatchFoundCheckers = fullMatchFoundCheckers
		this.partialMatchFoundCheckers = partialMatchFoundCheckers
		this.query = query
	}

	couldBeQueryFor(suggestion: TSuggestion): FileQueryResult{
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

	static topFolderCheck<TSuggestion extends ISuggestion> (queryPath: ObsidianPath, context:IEditorSuggestContext, settings: NoteAutoCreatorSettings): MatchChecker<TSuggestion>{
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
}

export class FileQuery extends Query<FileSuggestion>{
	constructor(query: string, fullMatchFoundCheckers: FileMatchChecker[], partialMatchFoundCheckers: FileMatchChecker[]) {
		super(query, fullMatchFoundCheckers, partialMatchFoundCheckers)
	}

	static aliasCheck(queryPath: ObsidianFilePath) : FileMatchChecker {
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

		const fullMatchFoundCheckers: FileMatchChecker[] = [
			getMatcherForExactMatch(lowerCaseQueryPath)
		]

		const partialMatchFoundCheckers: FileMatchChecker = allTrue([
			this.topFolderCheck(lowerCaseQueryPath, context, settings),
			anyTrue([
				getMatcherForPartialMatch(lowerCaseQueryPath),
				this.aliasCheck(lowerCaseQueryPath)
			])
		])

		return new FileQuery(query, fullMatchFoundCheckers, [partialMatchFoundCheckers])
	}

	static forTemplateSuggestions(query: string): FileQuery{
		const lowerCaseQueryPath = new ObsidianFilePath(query.toLowerCase())

		const fullMatchFoundCheckers: FileMatchChecker[] = [
			getMatcherForExactMatch(lowerCaseQueryPath)
		]

		const partialMatchFoundCheckers: FileMatchChecker[] = [
			getMatcherForPartialMatch(lowerCaseQueryPath),
		]

		return new FileQuery(query, fullMatchFoundCheckers, partialMatchFoundCheckers)
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
