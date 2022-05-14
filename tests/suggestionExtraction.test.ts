import {extractSuggestionTrigger} from "../src/suggestionExtraction";

const baseCases = [
	{inputLine: "", cursorPosition:{line: 1, ch: 5}, expectedTrigger: null, description: 'line is empty', triggerSymbol: ""},
	{inputLine: "@Some line", cursorPosition:{line: 1, ch: 0}, expectedTrigger: null, description: 'cursor is at start of line', triggerSymbol: ""},
	{inputLine: "Some line", cursorPosition:{line: 1, ch: 3}, expectedTrigger: null, description: 'there is no trigger symbol on the line', triggerSymbol: ""},
	{inputLine: "@", cursorPosition:{line: 1, ch: 1}, expectedTrigger: {startIndex: 1, endIndex: 1, query: ''}, description: 'line only has trigger symbol', triggerSymbol: ""},
	{inputLine: "My line @", cursorPosition:{line: 1, ch: 9}, expectedTrigger: {startIndex: 9, endIndex: 9, query: ''}, description: 'trigger symbol is at the end of the line', triggerSymbol: ""},
	{inputLine: "This is @James Jameson", cursorPosition:{line: 1, ch: 22}, expectedTrigger: {startIndex: 9, endIndex: 22, query: 'James Jameson'}, description: 'trigger symbol is in middle of line', triggerSymbol: ""},
	{inputLine: "My [[name]] is @John", cursorPosition:{line: 1, ch: 20}, expectedTrigger: {startIndex: 16, endIndex: 20, query: 'John'}, description: 'trigger symbol is after obsidian link', triggerSymbol: ""},
	{inputLine: "My [[name @test]] is @John", cursorPosition:{line: 1, ch: 26}, expectedTrigger: {startIndex: 22, endIndex: 26, query: 'John'}, description: 'trigger symbol is after obsidian link with trigger symbol', triggerSymbol: ""},
	{inputLine: "My email is [[James@testing.com]]", cursorPosition:{line: 1, ch: 33}, expectedTrigger: null, description: 'trigger symbol is inside obsidian link', triggerSymbol: ""},
	{inputLine: "My @name is [[James]]", cursorPosition:{line: 1, ch: 8}, expectedTrigger: {startIndex: 4, endIndex: 8, query: 'name'}, description: 'trigger symbol and cursor is before obsidian link', triggerSymbol: ""},
	{inputLine: "My email is James@testing.com", cursorPosition:{line: 1, ch: 29}, expectedTrigger: null, description: 'trigger symbol is in the middle of a word', triggerSymbol: ""},
	{inputLine: "My email is James@", cursorPosition:{line: 1, ch: 18}, expectedTrigger: null, description: 'trigger symbol is in the end of a word', triggerSymbol: ""},
	{inputLine: "this is @trigger|a trigger", cursorPosition:{line: 1, ch: 26}, expectedTrigger: {startIndex: 9, endIndex: 26, query: 'trigger|a trigger'}, description: 'alias included in trigger', triggerSymbol: ""},
	{inputLine: "this is @trigger|", cursorPosition:{line: 1, ch: 17}, expectedTrigger: {startIndex: 9, endIndex: 17, query: 'trigger|'}, description: 'empty alias included in trigger', triggerSymbol: ""},
	{inputLine: "My email is @James@testing.com", cursorPosition:{line: 1, ch: 30}, expectedTrigger: {startIndex: 13, endIndex: 30, query: 'James@testing.com'}, description: 'trigger symbol is followed by another trigger symbol', triggerSymbol: ""},
]

const triggerSymbolsToTest = ["@", "$", "!", "#", "<"]

describe('a suggestion trigger using a single letter trigger symbol', function () {
	const allTestCases = baseCases.flatMap(testData => triggerSymbolsToTest.map(symbol => {
		// I'm not proud of this code, but it does the job, so I'll keep it for now.
		// @ts-ignore
		const inputLine = testData.inputLine.replaceAll("@", symbol);

		let expectedTrigger = testData.expectedTrigger

		if (expectedTrigger){
			expectedTrigger = {
				startIndex: testData.expectedTrigger.startIndex,
				endIndex: testData.expectedTrigger.endIndex,
				// @ts-ignore
				query: testData.expectedTrigger.query.replaceAll("@", symbol)
			};
		}

		return {
			inputLine: inputLine,
			cursorPosition: testData.cursorPosition,
			expectedTrigger: expectedTrigger,
			triggerSymbol: symbol}
	}))


	it.each(allTestCases)('has trigger $expectedTrigger when $description using trigger symbol $triggerSymbol', (testData) => {
		// @ts-ignore
		testData.inputLine = testData.inputLine.replaceAll("@", testData.triggerSymbol)
		const observedTrigger = extractSuggestionTrigger(testData.inputLine, testData.cursorPosition, testData.triggerSymbol);

		if (testData.expectedTrigger === null){
			expect(observedTrigger).toBeNull()
			return
		}

		expect(observedTrigger).not.toBeNull()

		expect(observedTrigger.end).toEqual({line: testData.cursorPosition.line, ch: testData.expectedTrigger.endIndex});
		expect(observedTrigger.start).toEqual({line: testData.cursorPosition.line, ch: testData.expectedTrigger.startIndex});
		expect(observedTrigger.query).toEqual(testData.expectedTrigger.query);
	})
});

describe('a suggestion trigger using multi-letter trigger symbols', function () {
	it.each([
		{triggerSymbols: '@@', input: '@ @'},
		{triggerSymbols: '@@', input: '@ some text @ some other text'},
		{triggerSymbols: '$$', input: '$ some text $ some other text'},
	])('does not trigger if symbols are separated in $input', ({triggerSymbols, input}) => {
		const observedTrigger = extractSuggestionTrigger(input, {line: 1, ch: input.length}, triggerSymbols)
		expect(observedTrigger).toBeNull()
	})

	it.each([
		{triggerSymbols: '@@', input: '@@My note', expectedQuery: 'My note', expectedStart: 2},
		{triggerSymbols: '@@', input: 'This is @@My note', expectedQuery: 'My note', expectedStart: 10},
		{triggerSymbols: '@@', input: 'This is @@My note with double @@symbols', expectedQuery: 'My note with double @@symbols', expectedStart: 10},
		{triggerSymbols: '@@', input: 'This will be empty @@', expectedQuery: "", expectedStart: 21},
		{triggerSymbols: '$$', input: 'I am $$using double dollars', expectedQuery: 'using double dollars', expectedStart: 7},
		{triggerSymbols: '&&&', input: 'this should &&& be picked up', expectedQuery: ' be picked up', expectedStart: 15},
	])('triggers correctly if input is $input', ({triggerSymbols, input, expectedQuery, expectedStart}) => {
		const observedTrigger = extractSuggestionTrigger(input, {line: 1, ch: input.length}, triggerSymbols)

		expect(observedTrigger).not.toBeNull()
		expect(observedTrigger.query).toEqual(expectedQuery);
		expect(observedTrigger.start).toEqual({line: 1, ch: expectedStart});
	})
});




