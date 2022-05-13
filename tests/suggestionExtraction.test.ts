import {extractSuggestionTrigger} from "../src/suggestionExtraction";

describe('a suggestion trigger', function () {
	it.each([
		{inputLine: "", cursorPosition:{line: 1, ch: 5}, expectedTrigger: null, description: 'line is empty'},
		{inputLine: "@Some line", cursorPosition:{line: 1, ch: 0}, expectedTrigger: null, description: 'cursor is at start of line'},
		{inputLine: "Some line", cursorPosition:{line: 1, ch: 3}, expectedTrigger: null, description: 'there is no trigger symbol on the line'},
		{inputLine: "@", cursorPosition:{line: 1, ch: 1}, expectedTrigger: {startIndex: 1, endIndex: 1, query: ''}, description: 'line only has trigger symbol'},
		{inputLine: "My line @", cursorPosition:{line: 1, ch: 9}, expectedTrigger: {startIndex: 9, endIndex: 9, query: ''}, description: 'trigger symbol is at the end of the line'},
		{inputLine: "This is @James Jameson", cursorPosition:{line: 1, ch: 22}, expectedTrigger: {startIndex: 9, endIndex: 22, query: 'James Jameson'}, description: 'trigger symbol is in middle of line'},
		{inputLine: "My email is @James@testing.com", cursorPosition:{line: 1, ch: 30}, expectedTrigger: {startIndex: 13, endIndex: 30, query: 'James@testing.com'}, description: 'trigger symbol is followed by another trigger symbol'},
		{inputLine: "My [[name]] is @John", cursorPosition:{line: 1, ch: 20}, expectedTrigger: {startIndex: 16, endIndex: 20, query: 'John'}, description: 'trigger symbol is after obsidian link'},
		{inputLine: "My [[name @test]] is @John", cursorPosition:{line: 1, ch: 26}, expectedTrigger: {startIndex: 22, endIndex: 26, query: 'John'}, description: 'trigger symbol is after obsidian link with trigger symbol'},
		{inputLine: "My email is [[James@testing.com]]", cursorPosition:{line: 1, ch: 33}, expectedTrigger: null, description: 'trigger symbol is inside obsidian link'},
		{inputLine: "My @name is [[James]]", cursorPosition:{line: 1, ch: 8}, expectedTrigger: {startIndex: 4, endIndex: 8, query: 'name'}, description: 'trigger symbol and cursor is before obsidian link'},
		{inputLine: "My email is James@testing.com", cursorPosition:{line: 1, ch: 29}, expectedTrigger: null, description: 'trigger symbol is in the middle of a word'},
		{inputLine: "My email is James@", cursorPosition:{line: 1, ch: 18}, expectedTrigger: null, description: 'trigger symbol is in the end of a word'},
		{inputLine: "this is @trigger|a trigger", cursorPosition:{line: 1, ch: 26}, expectedTrigger: {startIndex: 9, endIndex: 26, query: 'trigger|a trigger'}, description: 'alias included in trigger'},
		{inputLine: "this is @trigger|", cursorPosition:{line: 1, ch: 17}, expectedTrigger: {startIndex: 9, endIndex: 17, query: 'trigger|'}, description: 'empty alias included in trigger'},
	])('has trigger $expectedTrigger when $description', (testData) => {
		const observedTrigger = extractSuggestionTrigger(testData.inputLine, testData.cursorPosition);

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




