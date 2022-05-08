import {
	extractSuggestionTrigger,
	IMetadataCollection,
	Suggestion,
	SuggestionCollector
} from "../src/suggestionsCollection";


describe('the list of suggestions', function () {
	test('is empty if there are no files in the vault', () => {
		const metadata = <IMetadataCollection>{getUnresolvedLinks: () => {} };
		const collector = new SuggestionCollector(metadata);

		const suggestions = collector.getSuggestions("");

		expect(suggestions).toEqual<Suggestion[]>([]);
	})

	test('contains all files in the vault', () => {
		const files = [
			"james bond.md",
			"how to cook.md",
			"articles/my happy wedding.md",
			"notes/2022/05/02/daily.md",
		]

		const unresolvedLinks = files.reduce((collection: Record<string, Record<string, number>>, file) => {
			collection[file] = {}
			return collection
		}, {})
		const metadata = <IMetadataCollection>{getUnresolvedLinks: () => unresolvedLinks };
		const collector = new SuggestionCollector(metadata);

		const suggestions = collector.getSuggestions("");

		expect(suggestions.map(su => su.VaultPath).sort()).toEqual(files.sort());
	})

	test('contains links that do not have any files created for them', () => {
		const unresolvedLinks = {
			'document 1.md': {
				'Some link': 1,
				'another link': 13
			},
			'Some other markdown.md': {},
			'Hello world.md': {'I have no page.md': 1}
		}

		const metadata = <IMetadataCollection>{getUnresolvedLinks: () => unresolvedLinks };
		const collector = new SuggestionCollector(metadata);

		const suggestions = collector.getSuggestions("");
		const expectedSuggestionTitles = [
			'document 1',
			'Some link',
			'another link',
			'Some other markdown',
			'Hello world',
			'I have no page'
		]

		expect(suggestions.map(su => su.Title).sort()).toEqual(expectedSuggestionTitles.sort());

	})

	test('contains only one suggestion per link', () => {
		const unresolvedLinks = {
			'document 1.md': {
				'Some link': 1,
			},
			'Some other markdown.md': {},
			'Hello world.md': {'Some link': 1}
		}

		const metadata = <IMetadataCollection>{getUnresolvedLinks: () => unresolvedLinks };
		const collector = new SuggestionCollector(metadata);

		const suggestions = collector.getSuggestions("");
		const expectedSuggestionTitles = [
			'document 1',
			'Some link',
			'Some other markdown',
			'Hello world',
		]

		expect(suggestions.map(su => su.Title).sort()).toEqual(expectedSuggestionTitles.sort());
	})

	test('may contains multiple suggestions with same names if they are in separate locations', () => {
		const unresolvedLinks = {
			'document 1.md': {
				'Some link': 1,
			},
			'Some other markdown.md': {},
			'Hello world.md': {'Other folder/Some link': 1}
		}

		const metadata = <IMetadataCollection>{getUnresolvedLinks: () => unresolvedLinks };
		const collector = new SuggestionCollector(metadata);

		const suggestions = collector.getSuggestions("");
		const expectedSuggestionTitles = [
			'document 1',
			'Some link',
			'Some other markdown',
			'Hello world',
			'Some link',
		]

		expect(suggestions.map(su => su.Title).sort()).toEqual(expectedSuggestionTitles.sort());
	})

	test('is sorted in alphabetical order by suggestion title', () => {
		const unresolvedLinks = {
			'document 1.md': {
				'Some link': 1,
			},
			'Some other markdown.md': {},
			'Hello world.md': {'Other folder/Some link': 1}
		}

		const metadata = <IMetadataCollection>{getUnresolvedLinks: () => unresolvedLinks };
		const collector = new SuggestionCollector(metadata);

		const suggestions = collector.getSuggestions("");
		const expectedSuggestionTitles = [
			'document 1',
			'Hello world',
			'Some link',
			'Some link',
			'Some other markdown',
		]

		expect(suggestions.map(su => su.Title)).toEqual(expectedSuggestionTitles);
	})

	it.each([
		{query: 'ja', expectedFiles: ['ja', 'jack.md']},
		{query: 'b', expectedFiles: ['b', 'bob.md', 'bobby.md']},
		{query: 'B', expectedFiles: ['B', 'bob.md', 'bobby.md']},
		{query: 's', expectedFiles: ['s', 'Simon.md']},
		{query: '', expectedFiles: ['bob.md', 'bobby.md', 'jack.md', 'Simon.md']},
		{query: 'p', expectedFiles: ['p']},
		{query: 'md', expectedFiles: ['md']},
	])('filtered with "$query" returns $expectedFiles', ({query, expectedFiles}) => {
		const unresolvedLinks = {
			'bob.md': {},
			'bobby.md': {},
			'jack.md': {},
			'Simon.md': {},
		}

		const metadata = <IMetadataCollection>{getUnresolvedLinks: () => unresolvedLinks };
		const collector = new SuggestionCollector(metadata);

		const observedSuggestions = collector.getSuggestions(query);
		expect(observedSuggestions.map(su => su.VaultPath).sort()).toEqual(expectedFiles.sort())
	})

	test('Query is first in returned suggestions', () => {
		const unresolvedLinks = {
			'bob.md': {},
			'jack.md': {},
		}

		const query = 'b';

		const expectedSuggestions: Suggestion[] = [
			new Suggestion(query),
			new Suggestion('bob.md'),
		]

		const metadata = <IMetadataCollection>{getUnresolvedLinks: () => unresolvedLinks };
		const collector = new SuggestionCollector(metadata);

		const observedSuggestions = collector.getSuggestions(query);
		expect(observedSuggestions).toEqual(expectedSuggestions)

	})
});

describe('a single suggestion', function () {
	it.each([
		{vaultPath: 'folder1/folder2/mynote.md', expectedFolderPath: 'folder1/folder2'},
		{vaultPath: 'folder2/mynote.md', expectedFolderPath: 'folder2'},
		{vaultPath: 'mynote.md', expectedFolderPath: undefined},
	])('does not contain file name in folder path when vault path is $vaultPath', ({vaultPath, expectedFolderPath}) => {
		const suggestion = new Suggestion(vaultPath);

		expect(suggestion.FolderPath).toBe(expectedFolderPath)
	})

	it.each([
		{vaultPath: 'folder1/folder2/mynote.md', expectedTitle: 'mynote'}, // normal link
		{vaultPath: 'folder1/folder2/some note', expectedTitle: 'some note'}, // link without extension
		{vaultPath: 'folder1/folder2/with some extension.exe', expectedTitle: 'with some extension'}, // wrong extension given
	])('uses title $expectedTitle when vault path is $vaultPath', ({vaultPath, expectedTitle}) => {
		const suggestion = new Suggestion(vaultPath);

		expect(suggestion.Title).toBe(expectedTitle)
	})

	it.each([
		{vaultPath: 'folder1/folder2/.md'},
		{vaultPath: 'folder1/'},
		{vaultPath: ''},
		{vaultPath: '/'},
	])('has empty title when vault path is $vaultPath', ({vaultPath}) => {
		const suggestion = new Suggestion(vaultPath);

		expect(suggestion.Title).toBe('')
	})

	it.each([
		{vaultPath: ' folder1/folder2/file.md', expected: 'folder1/folder2/file.md'},
		{vaultPath: 'folder1/note ', expected: 'folder1/note'},
		{vaultPath: ' folder/name ', expected: 'folder/name'},
	])('has no extra white space in paths when vault path is $vaultPath', ({vaultPath, expected}) => {
		const suggestion = new Suggestion(vaultPath);

		expect(suggestion.VaultPath).toBe(expected)
	})

	it.each([
		{vaultPath: 'folder1/folder2/mynote.md'},
		{vaultPath: 'folder1/folder2/some note'},
		{vaultPath: 'reading/books/short-stories/how I Won.md'},
		{vaultPath: 'note.md'},
	])('stores $vaultPath as vault path', ({vaultPath}) => {
		const suggestion = new Suggestion(vaultPath);

		expect(suggestion.VaultPath).toBe(vaultPath)
	})
});

describe('when the suggestion for a link to a non-existing file is accepted', function () {
	test('the file is created', () => {

	})

	test('missing folders in the link path are created if they do not exist', () => {

	})

	test('only the suggestion name is shown in the document', () => {

	})
});

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

test('no file is created if the suggestion name is empty', () => {

})




