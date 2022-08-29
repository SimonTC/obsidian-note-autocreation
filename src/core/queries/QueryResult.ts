export class QueryResult {
	isCompleteMatch: boolean
	isAtLeastPartialMatch: boolean
	isNoMatch: boolean

	private constructor(isAtLeastPartialMatch: boolean, isCompleteMatch: boolean) {
		this.isCompleteMatch = isCompleteMatch
		this.isAtLeastPartialMatch = isAtLeastPartialMatch
		this.isNoMatch = !(isCompleteMatch || isAtLeastPartialMatch)
	}

	static forCompleteMatch(): QueryResult {
		return new QueryResult(true, true)
	}

	static forPartialMatch(): QueryResult {
		return new QueryResult(true, false)
	}

	static forNoMatch(): QueryResult {
		return new QueryResult(false, false)
	}
}
