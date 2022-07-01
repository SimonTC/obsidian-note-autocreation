import {TemplateSuggestion} from "../src/core/suggestions/TemplateSuggestion"
import {Fake} from "./Fake"
import {
	AliasNoteSuggestion,
	ExistingNoteSuggestion,
	NewNoteSuggestion,
	NoteSuggestion
} from "../src/core/suggestions/NoteSuggestion"
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

test('alias suggestion is returned when query is alias for existing note', () => {
    const links = [
		Fake.LinkToExistingNote('my note.md').withAlias('My Alias')
	]
	const interOp = Fake.Interop.withMetadataCollection(Fake.MetaDataCollection.withLinkSuggestions(links))
	const collector = new SuggestionCollector(interOp, Fake.Settings)

	const query = 'ali'
	const expectedSuggestions: NoteSuggestion[] = [
		new NewNoteSuggestion(query),
		new AliasNoteSuggestion('my note.md', 'My Alias'),
	]

	const observedSuggestions = collector.getSuggestions(query)
	expect(observedSuggestions).toStrictEqual(expectedSuggestions)
})

test('Suggestions for non existing notes are not returned if that feature has been disabled', () => {
	const links = [
		Fake.LinkToNotExistingNote('my note'),
		Fake.LinkToExistingNote('my other note.md')
	]
	const interOp = Fake.Interop.withMetadataCollection(Fake.MetaDataCollection.withLinkSuggestions(links))
	const settings = Fake.Settings
	settings.suggestLinksToNonExistingNotes = false
	const collector = new SuggestionCollector(interOp, settings)

	const query = 'note'
	const expectedSuggestions: NoteSuggestion[] = [
		new NewNoteSuggestion(query),
		new ExistingNoteSuggestion('my other note.md'),
	]

	const observedSuggestions = collector.getSuggestions(query)
	expect(observedSuggestions).toStrictEqual(expectedSuggestions)
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
