import 'jest-extended'
import {Fake} from "./Fake"
import {HeadingCache} from "obsidian"
import {HeaderSuggestionCollector} from "../src/core/suggestionCollection/HeaderSuggestionCollector"
import {ExistingNoteSuggestion} from "../src/core/suggestions/NoteSuggestion"
import {HeaderSuggestion} from "../src/core/suggestions/HeaderSuggestion"

const fakeExistingNote = new ExistingNoteSuggestion('My note')

it.each([
	{query: ''},
	{query: 'he'},
])('no suggestions are returned when there are no headers in the note and the query is "$query"', ({query}) => {
	const headers = new Map<string, HeadingCache[]>([[fakeExistingNote.VaultPath, []]])
	const metadataCollection = Fake.MetaDataCollection.withHeaders(headers)
	const collector = new HeaderSuggestionCollector(metadataCollection)

	const observedSuggestions = collector.getSuggestions(query, fakeExistingNote)

	expect(observedSuggestions).toBeEmpty()
})

describe('when there are headers in the note', function () {
	test('all suggestions for all headers are returned when the query is empty', () => {
		const headers = [
			Fake.HeadingCache.withTitle('Duplicate Header').withLevel(1),
			Fake.HeadingCache.withTitle('Header 1').withLevel(1),
			Fake.HeadingCache.withTitle('Header 2').withLevel(2),
			Fake.HeadingCache.withTitle('Other Header 2').withLevel(2),
			Fake.HeadingCache.withTitle('Duplicate Header').withLevel(1),
		]

		const expectedSuggestions = [
			new HeaderSuggestion('Duplicate Header', 1, undefined, fakeExistingNote),
			new HeaderSuggestion('Header 1', 1, undefined, fakeExistingNote),
			new HeaderSuggestion('Header 2', 2, undefined, fakeExistingNote),
			new HeaderSuggestion('Other Header 2', 2, undefined, fakeExistingNote),
			new HeaderSuggestion('Duplicate Header', 1, undefined, fakeExistingNote),
		]

		const headerMap = new Map<string, HeadingCache[]>([
			[fakeExistingNote.VaultPath, headers
		]])
		const metadataCollection = Fake.MetaDataCollection.withHeaders(headerMap)
		const collector = new HeaderSuggestionCollector(metadataCollection)

		const observedSuggestions = collector.getSuggestions('', fakeExistingNote)

		expect(observedSuggestions).toStrictEqual(expectedSuggestions)
	})

	test('includes alias if alias is given after header trigger', () => {
		const headers = [
			Fake.HeadingCache.withTitle('Header 1').withLevel(1),
		]

		const headerMap = new Map<string, HeadingCache[]>([[fakeExistingNote.VaultPath, headers]])
		const metadataCollection = Fake.MetaDataCollection.withHeaders(headerMap)
		const collector = new HeaderSuggestionCollector(metadataCollection)

		const observedSuggestions = collector.getSuggestions('Header 1|some alias', fakeExistingNote)
		expect(observedSuggestions.length).toBe(1)
		const suggestion = observedSuggestions[0]
		expect(suggestion.Alias).toBe('some alias')
		expect(suggestion.Title).toBe('Header 1')
	})

	test('uses the original note alias if two aliases are given', () => {
		const headers = [
			Fake.HeadingCache.withTitle('Header 1').withLevel(1),
		]
		const note = new ExistingNoteSuggestion('My note|Note alias')

		const headerMap = new Map<string, HeadingCache[]>([[note.VaultPath, headers]])
		const metadataCollection = Fake.MetaDataCollection.withHeaders(headerMap)
		const collector = new HeaderSuggestionCollector(metadataCollection)

		const observedSuggestions = collector.getSuggestions('Header 1|some alias', note)
		expect(observedSuggestions.length).toBe(1)
		const suggestion = observedSuggestions[0]
		expect(suggestion.Alias).toBe('Note alias')
		expect(suggestion.Title).toBe('Header 1')
	})

	it.each([
		{query: 'he', expectedHeaders: ['Header 1', 'Header 2', 'Other Header 2']},
		{query: 'Header', expectedHeaders: ['Header 1', 'Header 2', 'Other Header 2']},
		{query: 'oth', expectedHeaders: ['Other Header 2']},
		{query: 'Other', expectedHeaders: ['Other Header 2']},
		{query: '2', expectedHeaders: ['Header 2', 'Other Header 2']},
		{query: 'Non existing', expectedHeaders: []},

	])('suggestions are correctly filtered when the query is "$query"', ({query, expectedHeaders}) => {
		const headers = [
			Fake.HeadingCache.withTitle('Header 1').withLevel(1),
			Fake.HeadingCache.withTitle('Header 2').withLevel(2),
			Fake.HeadingCache.withTitle('Other Header 2').withLevel(2),
		]
		const headerMap = new Map<string, HeadingCache[]>([[fakeExistingNote.VaultPath, headers]])
		const metadataCollection = Fake.MetaDataCollection.withHeaders(headerMap)
		const collector = new HeaderSuggestionCollector(metadataCollection)

		const observedSuggestions = collector.getSuggestions(query, fakeExistingNote)

		expect(observedSuggestions.map(s => s.Title)).toStrictEqual(expectedHeaders)
	})
})
