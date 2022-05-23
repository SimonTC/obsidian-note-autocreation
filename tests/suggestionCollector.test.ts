import {TemplateSuggestion} from "../src/core/TemplateSuggestion"
import {Fake} from "./Fake"
import {SuggestionCollector} from "../src/core/suggestionCollection/NoteSuggestionCollector"
import {NoteSuggestion} from "../src/core/NoteSuggestion"

it.each([
	{query: 'my note'},
	{query: 'folder1/my note'},
	{query: 'my note|some alias'},
])('note suggestions are returned when the query is $query', ({query}) => {
	const interOp = Fake.Interop
	const collector = new SuggestionCollector(interOp)

	const observedSuggestions = collector.getSuggestions(query)
	expect(observedSuggestions.every(s => s instanceof NoteSuggestion)).toBe(true)
})

it.each([
	{query: 'my note$'},
	{query: 'folder1/my note$'},
	{query: 'my note|some alias$'},
])('template suggestions are returned when the query is $query', ({query}) => {
	const expectedSuggestions: TemplateSuggestion[] = []

	const interOp = Fake.Interop
	const collector = new SuggestionCollector(interOp)

	const observedSuggestions = collector.getSuggestions(query)
	expect(observedSuggestions).toEqual(expectedSuggestions)
})
