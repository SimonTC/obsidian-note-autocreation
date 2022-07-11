import {ObsidianFilePath} from "../ObsidianFilePath"
import {FileSuggestion} from "../suggestions/FileSuggestion"
import {AliasNoteSuggestion} from "../suggestions/NoteSuggestion"

type MatchChecker = (suggestion: FileSuggestion) => boolean

function getMatcherForExactMatch (lowerCaseQueryPath: ObsidianFilePath){
	return (suggestion: FileSuggestion) => suggestion.Path.VaultPathWithoutExtension.toLowerCase() === lowerCaseQueryPath.VaultPathWithoutExtension
}

function getMatcherForPartialMatch(lowerCaseQueryPath: ObsidianFilePath){
	return (suggestion: FileSuggestion) => {
		const path = suggestion.Path
		const queryIsAncestor = path.FolderPath.toLowerCase().includes(lowerCaseQueryPath.FolderPath)
		const queryCouldBeForSuggestedNote = path.VaultPath.toLowerCase()
			.replace(lowerCaseQueryPath.FolderPath, '')
			.includes(lowerCaseQueryPath.Title)
		return queryIsAncestor && queryCouldBeForSuggestedNote
	}
}

export class Query{
	private fullMatchFoundCheckers: MatchChecker[]
	private partialMatchFoundCheckers: MatchChecker[]

	constructor(fullMatchFoundCheckers: MatchChecker[], partialMatchFoundCheckers: MatchChecker[]) {
		this.fullMatchFoundCheckers = fullMatchFoundCheckers
		this.partialMatchFoundCheckers = partialMatchFoundCheckers
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

	static forNoteSuggestions(query: string): Query{
		const lowerCaseQueryPath = new ObsidianFilePath(query.toLowerCase())

		const fullMatchFoundCheckers: MatchChecker[] = [
			getMatcherForExactMatch(lowerCaseQueryPath)
		]

		const partialMatchFoundCheckers: MatchChecker[] = [
			getMatcherForPartialMatch(lowerCaseQueryPath),
			suggestion => {
				if (suggestion instanceof AliasNoteSuggestion){
					return suggestion.Alias.toLowerCase().includes(lowerCaseQueryPath.Title)
				}
				return false
			}
		]

		return new Query(fullMatchFoundCheckers, partialMatchFoundCheckers)
	}

	static forTemplateSuggestions(query: string): Query{
		const lowerCaseQueryPath = new ObsidianFilePath(query.toLowerCase())

		const fullMatchFoundCheckers: MatchChecker[] = [
			getMatcherForExactMatch(lowerCaseQueryPath)
		]

		const partialMatchFoundCheckers: MatchChecker[] = [
			getMatcherForPartialMatch(lowerCaseQueryPath),
		]

		return new Query(fullMatchFoundCheckers, partialMatchFoundCheckers)
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
