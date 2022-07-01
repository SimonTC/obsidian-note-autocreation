import 'jest-extended'
import {Fake} from "./Fake"
import {HeadingCache} from "obsidian"
import {HeaderSuggestionCollector} from "../src/core/suggestionCollection/HeaderSuggestionCollector"
import {ExistingNoteSuggestion} from "../src/core/suggestions/NoteSuggestion"

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

	})

	test('suggestions are filtered when the query is not empty', () => {

	})

	test('no suggestions are returned if no headers match the query', () => {

	})
})
