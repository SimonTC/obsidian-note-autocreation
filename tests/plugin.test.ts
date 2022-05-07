import {IMetadataCollection, Suggestion, SuggestionCollector} from "../src/suggestionsCollection";


describe('the list of suggestions', function () {
	test('is empty if there are no files in the vault', () => {
		const metadata = <IMetadataCollection>{getUnresolvedLinks: () => {} };
		const collector = new SuggestionCollector(metadata);

		const suggestions = collector.getSuggestions();

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

		const suggestions = collector.getSuggestions();

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

		const suggestions = collector.getSuggestions();
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

		const suggestions = collector.getSuggestions();
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

		const suggestions = collector.getSuggestions();
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

		const suggestions = collector.getSuggestions();
		const expectedSuggestionTitles = [
			'document 1',
			'Hello world',
			'Some link',
			'Some link',
			'Some other markdown',
		]

		expect(suggestions.map(su => su.Title)).toEqual(expectedSuggestionTitles);
	})

	test('filters out suggestions that do not contain the query text', () => {

	})

	test('does not use the trigger symbol for filtering', () => {

	})

	test('uses the trigger symbol for filtering if there is more than one instance of it', () => {

	})
});

describe('a single suggestion', function () {
	it.each([
		{vaultPath: 'folder1/folder2/mynote.md', expectedFolderPath: 'folder1/folder2'},
		{vaultPath: 'folder2/mynote.md', expectedFolderPath: 'folder2'},
		{vaultPath: 'mynote.md', expectedFolderPath: undefined},
	])('does not contain file name when vault path is $vaultPath', ({vaultPath, expectedFolderPath}) => {
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

test('no file is created if the suggestion name is empty', () => {

})




