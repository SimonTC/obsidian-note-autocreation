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

		expect(suggestions.map(su => su.VaultPath)).toEqual(files);
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

		expect(suggestions.map(su => su.Title)).toEqual(expectedSuggestionTitles);

	})

	test('only one suggestion per link', () => {

	})

	test('filters out suggestions that do not contain the query text', () => {

	})

	test('is sorted in alphabetical order by vault path', () => {

	})

	test('does not use the trigger symbol for filtering', () => {

	})

	test('uses the trigger symbol for filtering if there is more than one instance of it', () => {

	})
});

describe('a single suggestion', function () {
	test('has the folder of the link as a description', () => {

	})

	test('uses only the name of the link object as title', () => {
		const vaultPath = 'folder1/folder2/mynote.md';
		const suggestion = new Suggestion(vaultPath);

		expect(suggestion.Title).toBe('mynote')
	})

	test('has correct title when path has no extension', () => {
		const vaultPath = 'folder1/folder2/mynote';
		const suggestion = new Suggestion(vaultPath);

		expect(suggestion.Title).toBe('mynote')
	})

	test('has correct title when wrong extension is given', () => {
		const vaultPath = 'folder1/folder2/mynote.exe';
		const suggestion = new Suggestion(vaultPath);

		expect(suggestion.Title).toBe('mynote')
	})

	test('stores the full vault path', () => {
		const expectedPath = 'reading/books/short-stories/how I Won.md'
		const suggestion = new Suggestion(expectedPath)

		expect(suggestion.VaultPath).toEqual(expectedPath);
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




