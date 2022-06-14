import {ExistingNoteSuggestion, NewNoteSuggestion, NoteSuggestion} from "../src/core/suggestions/NoteSuggestion"
import {NoteSuggestionCollector} from "../src/core/suggestionCollection/NoteSuggestionCollector"
import {IMetadataCollection} from "../src/interop/ObsidianInterfaces"
import {faker} from "@faker-js/faker"
import 'jest-extended'

test('the suggestion collector can deal with big vaults', () => {
	const getFakeFile = () => {
		const fakePath = faker.system.directoryPath()
		const fakeFile = faker.system.commonFileName('md')
		return `${fakePath}/${fakeFile}`
	}

	const files = []
	for (let i = 0; i < 10000; i++) {
		files.push(getFakeFile())
	}

	const unresolvedLinks = files.reduce((collection: Record<string, Record<string, number>>, file) => {
		collection[file] = {}
		return collection
	}, {})
	const metadata = <IMetadataCollection>{getUnresolvedLinks: () => unresolvedLinks }
	const collector = new NoteSuggestionCollector(metadata)

	const startTime = performance.now()
	collector.getSuggestions("")
	const endTime = performance.now()

	const diff = endTime - startTime
	console.log(`Collecting suggestions took ${diff} ms.`)
	expect(diff).toBeLessThan(55)
})

describe('the list of suggestions', function () {
	test('is empty if there are no files in the vault', () => {
		const metadata = <IMetadataCollection>{getUnresolvedLinks: () => {} }
		const collector = new NoteSuggestionCollector(metadata)

		const suggestions = collector.getSuggestions("")

		expect(suggestions).toEqual<NoteSuggestion[]>([])
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
		const expectedSuggestions = files.map(f => new ExistingNoteSuggestion(f))
		const metadata = <IMetadataCollection>{getUnresolvedLinks: () => unresolvedLinks }
		const collector = new NoteSuggestionCollector(metadata)

		const suggestions = collector.getSuggestions("")

		expect(suggestions).toIncludeSameMembers(expectedSuggestions)
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

		const metadata = <IMetadataCollection>{getUnresolvedLinks: () => unresolvedLinks }
		const collector = new NoteSuggestionCollector(metadata)

		const suggestions = collector.getSuggestions("")
		const expectedSuggestions = [
			new ExistingNoteSuggestion('document 1.md'),
			new NewNoteSuggestion('Some link'),
			new NewNoteSuggestion('another link'),
			new ExistingNoteSuggestion('Some other markdown.md'),
			new ExistingNoteSuggestion('Hello world.md'),
			new NewNoteSuggestion('I have no page.md')
		]

		expect(suggestions).toIncludeSameMembers(expectedSuggestions)
	})

	test('contains links that do not have any files created for them when there is a query', () => {
		const unresolvedLinks = {
			'this note.md': {
				'this note does not exist': 1,
			}
		}

		const metadata = <IMetadataCollection>{getUnresolvedLinks: () => unresolvedLinks }
		const collector = new NoteSuggestionCollector(metadata)

		const suggestions = collector.getSuggestions("this")
		const expectedSuggestions = [
			new NewNoteSuggestion('this'),
			new ExistingNoteSuggestion('this note.md'),
			new NewNoteSuggestion('this note does not exist'),
		]

		expect(suggestions).toIncludeSameMembers(expectedSuggestions)
	})

	test('contains only one suggestion per link', () => {
		const unresolvedLinks = {
			'document 1.md': {
				'Some link': 1,
			},
			'Some other markdown.md': {},
			'Hello world.md': {'Some link': 1}
		}

		const metadata = <IMetadataCollection>{getUnresolvedLinks: () => unresolvedLinks }
		const collector = new NoteSuggestionCollector(metadata)

		const suggestions = collector.getSuggestions("")
		const expectedSuggestions = [
			new ExistingNoteSuggestion('document 1.md'),
			new NewNoteSuggestion('Some link'),
			new ExistingNoteSuggestion('Some other markdown.md'),
			new ExistingNoteSuggestion('Hello world.md'),
		]

		expect(suggestions).toIncludeSameMembers(expectedSuggestions)
	})

	test('may contains multiple suggestions with same names if they are in separate locations', () => {
		const unresolvedLinks = {
			'document 1.md': {
				'Some link': 1,
			},
			'Some other markdown.md': {},
			'Hello world.md': {'Other folder/Some link': 1}
		}

		const metadata = <IMetadataCollection>{getUnresolvedLinks: () => unresolvedLinks }
		const collector = new NoteSuggestionCollector(metadata)

		const suggestions = collector.getSuggestions("")
		const expectedSuggestions = [
			new ExistingNoteSuggestion('document 1.md'),
			new NewNoteSuggestion('Some link'),
			new ExistingNoteSuggestion('Some other markdown.md'),
			new ExistingNoteSuggestion('Hello world.md'),
			new NewNoteSuggestion('Other folder/Some link'),
		]

		expect(suggestions).toIncludeSameMembers(expectedSuggestions)
	})

	test('creates correct suggestion types', () => {
		const unresolvedLinks = {
			'document 1.md': {
				'Some link': 1,
			},
			'Some other markdown.md': {},
			'Hello world.md': {'Some other link': 1}
		}

		const expectedSuggestions: NoteSuggestion[] = [
			new ExistingNoteSuggestion('document 1.md'),
			new ExistingNoteSuggestion('Hello world.md'),
			new NewNoteSuggestion('Some link'),
			new NewNoteSuggestion('Some other link'),
			new ExistingNoteSuggestion('Some other markdown.md'),
		]

		const metadata = <IMetadataCollection>{getUnresolvedLinks: () => unresolvedLinks }
		const collector = new NoteSuggestionCollector(metadata)

		const suggestions = collector.getSuggestions("")

		expect(suggestions).toIncludeSameMembers(expectedSuggestions)
	})

	test('is sorted in alphabetical order by suggestion title', () => {
		const unresolvedLinks = {
			'document 1.md': {
				'Some link': 1,
			},
			'Some other markdown.md': {},
			'Hello world.md': {'Other folder/Some link': 1}
		}

		const metadata = <IMetadataCollection>{getUnresolvedLinks: () => unresolvedLinks }
		const collector = new NoteSuggestionCollector(metadata)

		const suggestions = collector.getSuggestions("")
		const expectedSuggestions = [
			new ExistingNoteSuggestion('document 1.md'),
			new ExistingNoteSuggestion('Hello world.md'),
			new NewNoteSuggestion('Some link'),
			new NewNoteSuggestion('Other folder/Some link'),
			new ExistingNoteSuggestion('Some other markdown.md'),
		]

		expect(suggestions).toIncludeSameMembers(expectedSuggestions)
	})

	it.each([
		{query: 'ja', expectedFiles: ['ja', 'jack.md']},
		{query: 'b', expectedFiles: ['b', 'bob.md', 'bobby.md']},
		{query: 'B', expectedFiles: ['B', 'bob.md', 'bobby.md']},
		{query: 's', expectedFiles: ['s', 'Simon.md']},
		{query: '', expectedFiles: ['bob.md', 'bobby.md', 'jack.md', 'Simon.md']},
		{query: 'p', expectedFiles: ['p']},
		{query: 'simon', expectedFiles: ['Simon.md']},
		{query: 'Simon', expectedFiles: ['Simon.md']},
		{query: 'bob', expectedFiles: ['bob.md', 'bobby.md']},
		{query: 'Bob', expectedFiles: ['bob.md', 'bobby.md']},
		{query: 'bob.md', expectedFiles: ['bob.md','bobby.md']},
	])('filtered with "$query" returns $expectedFiles', ({query, expectedFiles}) => {
		const unresolvedLinks = {
			'bob.md': {},
			'bobby.md': {},
			'jack.md': {},
			'Simon.md': {},
		}
		const expectedSuggestions = expectedFiles.map(f => new ExistingNoteSuggestion(f))
		const metadata = <IMetadataCollection>{getUnresolvedLinks: () => unresolvedLinks }
		const collector = new NoteSuggestionCollector(metadata)

		const observedSuggestions = collector.getSuggestions(query)
		expect(observedSuggestions).toIncludeSameMembers(expectedSuggestions)
	})

	test('includes alias if file already exist and alias is given', () => {
		const unresolvedLinks = {
			'bob.md': {},
			'Simon.md': {},
		}

		const metadata = <IMetadataCollection>{getUnresolvedLinks: () => unresolvedLinks }
		const collector = new NoteSuggestionCollector(metadata)

		const observedSuggestions = collector.getSuggestions('bob|the builder')
		expect(observedSuggestions.length).toBe(1)
		const suggestion = observedSuggestions[0]
		expect(suggestion.Alias).toBe('the builder')
		expect(suggestion.VaultPath).toBe('bob.md')
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

		const metadata = <IMetadataCollection>{getUnresolvedLinks: () => unresolvedLinks }
		const collector = new NoteSuggestionCollector(metadata)
		const expectedSuggestions = expectedFiles.map(f => new ExistingNoteSuggestion(f))

		const observedSuggestions = collector.getSuggestions(query)
		expect(observedSuggestions).toIncludeSameMembers(expectedSuggestions)
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

		const metadata = <IMetadataCollection>{getUnresolvedLinks: () => unresolvedLinks }
		const collector = new NoteSuggestionCollector(metadata)
		const expectedSuggestions = expectedFiles.map(f => new ExistingNoteSuggestion(f))

		const observedSuggestions = collector.getSuggestions(query)
		expect(observedSuggestions).toIncludeSameMembers(expectedSuggestions)
	})

	test('Query is first in returned suggestions', () => {
		const unresolvedLinks = {
			'bob.md': {},
			'jack.md': {},
		}

		const query = 'b'

		const expectedSuggestions: NoteSuggestion[] = [
			new ExistingNoteSuggestion(query),
			new ExistingNoteSuggestion('bob.md'),
		]

		const metadata = <IMetadataCollection>{getUnresolvedLinks: () => unresolvedLinks }
		const collector = new NoteSuggestionCollector(metadata)

		const observedSuggestions = collector.getSuggestions(query)
		expect(observedSuggestions).toIncludeSameMembers(expectedSuggestions)
	})
})
