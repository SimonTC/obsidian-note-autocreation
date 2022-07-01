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
			new HeaderSuggestion('Duplicate Header', 1, fakeExistingNote),
			new HeaderSuggestion('Header 1', 1, fakeExistingNote),
			new HeaderSuggestion('Header 2', 2, fakeExistingNote),
			new HeaderSuggestion('Other Header 2', 2, fakeExistingNote),
			new HeaderSuggestion('Duplicate Header', 1, fakeExistingNote),
		]

		const headerMap = new Map<string, HeadingCache[]>([
			[fakeExistingNote.VaultPath, headers
		]])
		const metadataCollection = Fake.MetaDataCollection.withHeaders(headerMap)
		const collector = new HeaderSuggestionCollector(metadataCollection)

		const observedSuggestions = collector.getSuggestions('', fakeExistingNote)

		expect(observedSuggestions).toStrictEqual(expectedSuggestions)
	})

	test('suggestions are filtered when the query is not empty', () => {

	})

	test('no suggestions are returned if no headers match the query', () => {

	})
})
