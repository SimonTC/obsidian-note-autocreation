import {Suggestion} from "../src/Suggestion";
import {SuggestionCollector} from "../src/SuggestionCollector";
import {IMetadataCollection} from "../src/ObsidianInterfaces";


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

	it.each([
		{query: 'Folder1', expectedFiles: ['Folder1', 'Folder1/Note1.md', 'Folder1/Item2.md']},
		{query: 'Folder1/', expectedFiles: ['Folder1/', 'Folder1/Note1.md', 'Folder1/Item2.md']},
		{query: 'Folder1/It', expectedFiles: ['Folder1/It', 'Folder1/Item2.md']}
	])('returns $expectedFiles when query is $query', ({query, expectedFiles}) => {
		const unresolvedLinks = {
			'bob.md': {},
			'Folder1/Note1.md': {},
			'Folder1/Item2.md': {},
			'Folder3/Item66.md': {},
		}

		const metadata = <IMetadataCollection>{getUnresolvedLinks: () => unresolvedLinks };
		const collector = new SuggestionCollector(metadata);

		const observedSuggestions = collector.getSuggestions(query);
		expect(observedSuggestions.map(su => su.VaultPath).sort()).toEqual(expectedFiles.sort())
	})

	it.each([
		{query: 'Folder1/fo', expectedFiles: ['Folder1/fo']},
		{query: 'Folder1/', expectedFiles: ['Folder1/', 'Folder1/item1.md', 'Folder1/item2.md']},
		{query: 'Folder1/1', expectedFiles: ['Folder1/1', 'Folder1/item1.md']},
	])('only returns items from subfolder when query $query is given', ({query, expectedFiles}) => {
		const unresolvedLinks = {
			'Folder1/item1.md': {},
			'Folder1/item2.md': {},
			'Folder2/folder item.md': {},
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
