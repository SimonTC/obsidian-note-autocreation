import {TemplateSuggestion} from "../src/core/suggestions/TemplateSuggestion"
import {Fake} from "./Fake"
import {NoteSuggestion} from "../src/core/suggestions/NoteSuggestion"
import {SuggestionCollector} from "../src/core/suggestionCollection/SuggestionCollector"

it.each([
	{query: 'my note'},
	{query: 'folder1/my note'},
	{query: 'my note|some alias'},
])('note suggestions are returned when the query is $query', ({query}) => {
	const interOp = Fake.Interop
	const collector = new SuggestionCollector(interOp, Fake.Settings)

	const observedSuggestions = collector.getSuggestions(query)
	expect(observedSuggestions.every(s => s instanceof NoteSuggestion)).toBe(true)
})

it.each([
	{query: 'my note$', trigger: '$'},
	{query: 'folder1/my note%', trigger: '%'},
	{query: 'my note|some alias¤', trigger: '¤'},
])('template suggestions are returned when the query is $query and template trigger is $trigger', ({query, trigger}) => {
	const expectedSuggestions: TemplateSuggestion[] = []

	const settings = Fake.Settings
	settings.templateTriggerSymbol = trigger
	const interOp = Fake.Interop
	interOp.enableTemplater()
	const collector = new SuggestionCollector(interOp, settings)

	const observedSuggestions = collector.getSuggestions(query)
	expect(observedSuggestions).toEqual(expectedSuggestions)
})
