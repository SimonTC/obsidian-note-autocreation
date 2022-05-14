export type DocumentLocation = {
	line: number,
	ch: number
}

export type SuggestionTrigger = {
	start: DocumentLocation,
	end: DocumentLocation,
	query: string
}


export function extractSuggestionTrigger(lineText: string, cursorPosition: DocumentLocation, triggerSymbol: string): SuggestionTrigger {
	const safeTriggerSymbol = triggerSymbol.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'); // this will escape any symbols that are unsafe in a regex expression
	const regex = new RegExp(`(?:^| )${safeTriggerSymbol}(?!.*]])(.*)`, "d"); // d flag is necessary to get the indices of the groups
	const triggerSymbolIndex = lineText.indexOf(triggerSymbol)
	if (lineText.length === 0 || cursorPosition.ch === 0 || triggerSymbolIndex == -1){
		return null;
	}

	const textToSearch = lineText.slice(0, cursorPosition.ch)
	const match = regex.exec(textToSearch)

	if (!match){
		return null;
	}

	const myMatch: any = match; // Need to convert to any to get access to the indices somewhat easily
	const query = match[1] // Contains the text of the first found group
	const groupIndices = myMatch.indices
	const queryStartIndex = Number(groupIndices[1][0])
	const queryEndIndex = Number(groupIndices[1][1])

	return {
		start: { line: cursorPosition.line, ch: queryStartIndex },
		end: { line: cursorPosition.line, ch: queryEndIndex  },
		query: query
	}
}
