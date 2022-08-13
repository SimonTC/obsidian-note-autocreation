import {
	AliasNoteSuggestion,
	ExistingNoteSuggestion,
	NewNoteSuggestion,
	NoteSuggestion
} from "../src/core/suggestions/NoteSuggestion"
import {NoteSuggestionCollector} from "../src/core/suggestionCollection/NoteSuggestionCollector"
import {faker} from "@faker-js/faker"
import 'jest-extended'
import {Fake} from "./Fake"

test('the suggestion collector can deal with big vaults', () => {
	const getFakeLink = () => {
		const fakePath = faker.system.directoryPath()
		const fakeFile = faker.system.commonFileName('md')
		return Fake.LinkToExistingNote(`${fakePath}/${fakeFile}`)
	}

	const links = []
	for (let i = 0; i < 10000; i++) {
		links.push(getFakeLink())
	}

	const metadata = Fake.MetaDataCollection.withLinkSuggestions(links)
	const collector = new NoteSuggestionCollector(metadata, Fake.Settings)

	const startTime = performance.now()
	collector.getSuggestions(Fake.NoteQuery(""))
	const endTime = performance.now()

	const diff = endTime - startTime
	console.log(`Collecting suggestions took ${diff} ms.`)
	expect(diff).toBeLessThan(80)
})

describe('the list of suggestions', function () {
	test('is empty if there are no files in the vault', () => {
		const metadata = Fake.MetaDataCollection.withLinkSuggestions([])
		const collector = new NoteSuggestionCollector(metadata, Fake.Settings)

		const suggestions = collector.getSuggestions(Fake.NoteQuery(""))

		expect(suggestions).toEqual<NoteSuggestion[]>([])
	})

	test('contains all files in the vault', () => {
		const links = [
			Fake.LinkToExistingNote("james bond.md"),
			Fake.LinkToExistingNote("how to cook.md"),
			Fake.LinkToExistingNote("articles/my happy wedding.md"),
			Fake.LinkToExistingNote("notes/2022/05/02/daily.md"),
		]

		const expectedSuggestions = links.map(f => new ExistingNoteSuggestion(f.path))
		const metadata = Fake.MetaDataCollection.withLinkSuggestions(links)
		const collector = new NoteSuggestionCollector(metadata, Fake.Settings)

		const suggestions = collector.getSuggestions(Fake.NoteQuery(""))

		expect(suggestions).toIncludeSameMembers(expectedSuggestions)
	})

	test('contains links that do not have any files created for them', () => {
		const links =
			[
				Fake.LinkToExistingNote('document 1.md'),
				Fake.LinkToNotExistingNote('Some link'),
				Fake.LinkToNotExistingNote('another link'),
				Fake.LinkToExistingNote('Some other markdown.md'),
				Fake.LinkToExistingNote('Hello world.md'),
				Fake.LinkToNotExistingNote('I have no page.md'),
			]

		const metadata = Fake.MetaDataCollection.withLinkSuggestions(links)
		const collector = new NoteSuggestionCollector(metadata, Fake.Settings)

		const suggestions = collector.getSuggestions(Fake.NoteQuery(""))
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
		const links =
			[
				Fake.LinkToExistingNote('this note.md'),
				Fake.LinkToNotExistingNote('this note does not exist'),
			]

		const metadata = Fake.MetaDataCollection.withLinkSuggestions(links)
		const collector = new NoteSuggestionCollector(metadata, Fake.Settings)

		const suggestions = collector.getSuggestions(Fake.NoteQuery("this"))
		const expectedSuggestions = [
			new NewNoteSuggestion('this'),
			new ExistingNoteSuggestion('this note.md'),
			new NewNoteSuggestion('this note does not exist'),
		]

		expect(suggestions).toIncludeSameMembers(expectedSuggestions)
	})

	test('contains only one suggestion per link', () => {
		const links =
			[
				Fake.LinkToExistingNote('document 1.md'),
				Fake.LinkToNotExistingNote('Some link'),
				Fake.LinkToExistingNote('Some other markdown.md'),
				Fake.LinkToNotExistingNote('Some link'),
				Fake.LinkToExistingNote('document 1.md'),
			]

		const metadata = Fake.MetaDataCollection.withLinkSuggestions(links)
		const collector = new NoteSuggestionCollector(metadata, Fake.Settings)

		const suggestions = collector.getSuggestions(Fake.NoteQuery(""))
		const expectedSuggestions = [
			new ExistingNoteSuggestion('document 1.md'),
			new NewNoteSuggestion('Some link'),
			new ExistingNoteSuggestion('Some other markdown.md'),
		]

		expect(suggestions).toIncludeSameMembers(expectedSuggestions)
	})

	test('may contains multiple suggestions with same names if they are in separate locations', () => {
		const links = [
			Fake.LinkToExistingNote('document 1.md'),
			Fake.LinkToNotExistingNote('Some link'),
			Fake.LinkToNotExistingNote('Other folder/Some link'),
		]

		const metadata = Fake.MetaDataCollection.withLinkSuggestions(links)
		const collector = new NoteSuggestionCollector(metadata, Fake.Settings)

		const suggestions = collector.getSuggestions(Fake.NoteQuery(""))
		const expectedSuggestions = [
			new ExistingNoteSuggestion('document 1.md'),
			new NewNoteSuggestion('Some link'),
			new NewNoteSuggestion('Other folder/Some link'),
		]

		expect(suggestions).toIncludeSameMembers(expectedSuggestions)
	})

	test('is sorted in alphabetical order by suggestion title', () => {
		const links = [
			Fake.LinkToExistingNote('document 1.md'),
			Fake.LinkToNotExistingNote('Some link'),
			Fake.LinkToExistingNote('Some other markdown.md'),
			Fake.LinkToExistingNote('Hello world.md'),
			Fake.LinkToNotExistingNote('Other folder/Some link'),
		]

		const metadata = Fake.MetaDataCollection.withLinkSuggestions(links)
		const collector = new NoteSuggestionCollector(metadata, Fake.Settings)

		const suggestions = collector.getSuggestions(Fake.NoteQuery(""))
		const expectedSuggestionPaths = [
			'document 1.md',
			'Hello world.md',
			'Some link',
			'Other folder/Some link',
			'Some other markdown.md',
		]

		expect(suggestions.map(s => s.Path.VaultPath)).toEqual(expectedSuggestionPaths)
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
		const links = [
			Fake.LinkToExistingNote('bob.md'),
			Fake.LinkToExistingNote('bobby.md'),
			Fake.LinkToExistingNote('jack.md'),
			Fake.LinkToExistingNote('Simon.md'),
		]
		const expectedSuggestions = expectedFiles.map(f => new ExistingNoteSuggestion(f))
		const metadata = Fake.MetaDataCollection.withLinkSuggestions(links)
		const collector = new NoteSuggestionCollector(metadata, Fake.Settings)

		const observedSuggestions = collector.getSuggestions(Fake.NoteQuery(query))
		expect(observedSuggestions).toIncludeSameMembers(expectedSuggestions)
	})

	test('includes alias if file already exist and alias is given', () => {
		const links = [
			Fake.LinkToExistingNote('bob.md'),
			Fake.LinkToExistingNote('Simon.md'),
		]

		const metadata = Fake.MetaDataCollection.withLinkSuggestions(links)
		const collector = new NoteSuggestionCollector(metadata, Fake.Settings)

		const observedSuggestions = collector.getSuggestions(Fake.NoteQuery('bob|the builder'))
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
		const links = [
			Fake.LinkToExistingNote('bob.md'),
			Fake.LinkToExistingNote('Folder1/Note1.md'),
			Fake.LinkToExistingNote('Folder1/Item2.md'),
			Fake.LinkToExistingNote('Folder3/Item66.md'),
		]

		const metadata = Fake.MetaDataCollection.withLinkSuggestions(links)
		const collector = new NoteSuggestionCollector(metadata, Fake.Settings)
		const expectedSuggestions = expectedFiles.map(f => new ExistingNoteSuggestion(f))

		const observedSuggestions = collector.getSuggestions(Fake.NoteQuery(query))
		expect(observedSuggestions).toIncludeSameMembers(expectedSuggestions)
	})

	it.each([
		{query: 'Folder1/fo', expectedFiles: ['Folder1/fo']},
		{query: 'Folder1/', expectedFiles: ['Folder1/', 'Folder1/item1.md', 'Folder1/item2.md']},
		{query: 'Folder1/1', expectedFiles: ['Folder1/1', 'Folder1/item1.md']},
	])('only returns items from subfolder when query $query is given', ({query, expectedFiles}) => {
		const links = [
			Fake.LinkToExistingNote('Folder1/item1.md'),
			Fake.LinkToExistingNote('Folder1/item2.md'),
			Fake.LinkToExistingNote('Folder2/folder item.md'),
		]

		const metadata = Fake.MetaDataCollection.withLinkSuggestions(links)
		const collector = new NoteSuggestionCollector(metadata, Fake.Settings)
		const expectedSuggestions = expectedFiles.map(f => new ExistingNoteSuggestion(f))

		const observedSuggestions = collector.getSuggestions(Fake.NoteQuery(query))
		expect(observedSuggestions).toIncludeSameMembers(expectedSuggestions)
	})

	test('returns the query as the first suggestion', () => {
		const links = [
			Fake.LinkToExistingNote('bob.md'),
			Fake.LinkToExistingNote('jack.md'),
		]

		const query = 'b'

		const expectedSuggestions: NoteSuggestion[] = [
			new NewNoteSuggestion(query),
			new ExistingNoteSuggestion('bob.md'),
		]

		const metadata = Fake.MetaDataCollection.withLinkSuggestions(links)
		const collector = new NoteSuggestionCollector(metadata, Fake.Settings)

		const observedSuggestions = collector.getSuggestions(Fake.NoteQuery(query))
		expect(observedSuggestions).toStrictEqual(expectedSuggestions)
	})

	test('does not contain an Alias Note suggestion if note has alias but query does not fit', () => {
		const links = [
			Fake.LinkToExistingNote('my note.md').withAlias('My Alias')
		]
		const metadata = Fake.MetaDataCollection.withLinkSuggestions(links)
		const collector = new NoteSuggestionCollector(metadata, Fake.Settings)

		const query = 'not'
		const expectedSuggestions: NoteSuggestion[] = [
			new NewNoteSuggestion(query),
			new ExistingNoteSuggestion('my note.md'),
		]

		const observedSuggestions = collector.getSuggestions(Fake.NoteQuery(query))
		expect(observedSuggestions).toStrictEqual(expectedSuggestions)
	})

	test('can contain multiple alias note suggestions for same note', () => {
		const links = [
			Fake.LinkToExistingNote('my note.md').withAlias('My Alias'),
			Fake.LinkToExistingNote('my note.md').withAlias('My Other Alias')
		]
		const metadata = Fake.MetaDataCollection.withLinkSuggestions(links)
		const collector = new NoteSuggestionCollector(metadata, Fake.Settings)

		const query = 'ali'
		const expectedSuggestions: NoteSuggestion[] = [
			new NewNoteSuggestion(query),
			new AliasNoteSuggestion('my note.md', 'My Alias'),
			new AliasNoteSuggestion('my note.md', 'My Other Alias'),
		]

		const observedSuggestions = collector.getSuggestions(Fake.NoteQuery(query))
		expect(observedSuggestions).toStrictEqual(expectedSuggestions)
	})
})


