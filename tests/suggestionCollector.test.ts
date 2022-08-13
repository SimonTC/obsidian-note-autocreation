import {Fake} from "./Fake"
import {
	AliasNoteSuggestion,
	ExistingNoteSuggestion,
	NewNoteSuggestion,
	NoteSuggestion
} from "../src/core/suggestions/NoteSuggestion"
import 'jest-extended'
import {SuggestionCollector} from "../src/core/suggestionCollection/SuggestionCollector"

it.each([
	{query: 'my note'},
	{query: 'folder1/my note'},
	{query: 'my note|some alias'},
])('note suggestions are returned when the query is $query', ({query}) => {
	const interOp = Fake.Interop
	const collector = new SuggestionCollector(interOp, Fake.Settings)

	const observedSuggestions = collector.getSuggestions(Fake.EditorSuggestionContext(query))
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

	const observedSuggestions = collector.getSuggestions(Fake.EditorSuggestionContext(query))
	expect(observedSuggestions).toStrictEqual(expectedSuggestions)
})

test('alias suggestion is returned when query is alias for existing note and suggestions for non-existing files are disabled', () => {
	const links = [
		Fake.LinkToExistingNote('my note.md').withAlias('My Alias')
	]
	const interOp = Fake.Interop.withMetadataCollection(Fake.MetaDataCollection.withLinkSuggestions(links))
	const settings = Fake.Settings
	settings.suggestLinksToNonExistingNotes = false
	const collector = new SuggestionCollector(interOp, settings)

	const query = 'ali'
	const expectedSuggestions: NoteSuggestion[] = [
		new NewNoteSuggestion(query),
		new AliasNoteSuggestion('my note.md', 'My Alias'),
	]

	const observedSuggestions = collector.getSuggestions(Fake.EditorSuggestionContext(query))
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

	const observedSuggestions = collector.getSuggestions(Fake.EditorSuggestionContext(query))
	expect(observedSuggestions).toStrictEqual(expectedSuggestions)
})

test('Only include suggestions with common ancestor if current file is ancestor of configured top folder ', () => {
    const links = [
		Fake.LinkToExistingNote('folder1/folder12/my note'),
		Fake.LinkToExistingNote('folder1/folder12/my other note'),
		Fake.LinkToExistingNote('folder1/folder12/folder123/deep note'),
		Fake.LinkToExistingNote('folder2/my note'),
	]

	const interOp = Fake.Interop.withMetadataCollection(Fake.MetaDataCollection.withLinkSuggestions(links))
	const settings = Fake.Settings
	const collector = new SuggestionCollector(interOp, settings)

	const query = 'note'
	const expectedSuggestions: NoteSuggestion[] = [
		new NewNoteSuggestion(query),
		new ExistingNoteSuggestion('folder1/folder12/my note'),
		new ExistingNoteSuggestion('folder1/folder12/my other note'),
		new ExistingNoteSuggestion('folder1/folder12/folder123/deep note'),
	]

	const suggestionContext = Fake.EditorSuggestionContext(query)
	const observedSuggestions = collector.getSuggestions(suggestionContext)
	expect(observedSuggestions).toIncludeSameMembers(expectedSuggestions)
})
