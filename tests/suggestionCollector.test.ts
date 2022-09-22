import {Fake} from "./Fake"
import {
	AliasNoteSuggestion,
	ExistingNoteSuggestion,
	NewNoteSuggestion,
	NoteSuggestion
} from "../src/core/suggestions/NoteSuggestion"
import 'jest-extended'
import {SuggestionCollector} from "../src/core/suggestionCollection/SuggestionCollector"
import {ObsidianFolderPath} from "../src/core/paths/ObsidianFolderPath"
import {FolderSuggestion} from "../src/core/suggestions/FolderSuggestion"
import {ISuggestion} from "../src/core/suggestions/ISuggestion"
import {FolderSuggestionMode} from "../src/settings/NoteAutoCreatorSettings"

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

test('Only include suggestions with common ancestor if current file is descendent of configured top folder ', () => {
    const links = [
		Fake.LinkToExistingNote('folder1/folder12/my note'),
		Fake.LinkToExistingNote('folder1/folder12/my other note'),
		Fake.LinkToExistingNote('folder1/folder12/folder123/deep note'),
		Fake.LinkToExistingNote('folder2/my note'),
	]

	const interOp = Fake.Interop.withMetadataCollection(Fake.MetaDataCollection.withLinkSuggestions(links))
	const settings = Fake.Settings
	settings.relativeTopFolders = [new ObsidianFolderPath('folder1')]
	const collector = new SuggestionCollector(interOp, settings)

	const query = 'note'
	const expectedSuggestions: NoteSuggestion[] = [
		new NewNoteSuggestion(query),
		new ExistingNoteSuggestion('folder1/folder12/my note'),
		new ExistingNoteSuggestion('folder1/folder12/my other note'),
		new ExistingNoteSuggestion('folder1/folder12/folder123/deep note'),
	]

	const suggestionContext = Fake.EditorSuggestionContext(query).withFile(Fake.File('folder1/folder133/my note'))

	const observedSuggestions = collector.getSuggestions(suggestionContext)
	expect(observedSuggestions).toIncludeSameMembers(expectedSuggestions)
})

test('Only include suggestions from nearest top folder', () => {
	const links = [
		Fake.LinkToExistingNote('folder1/subfolder/note1'),
		Fake.LinkToExistingNote('folder2/subfolder/note2'),
		Fake.LinkToExistingNote('folder1/subfolder/subfolder/note3'),
		Fake.LinkToExistingNote('folder1/subfolder/subfolder/note4'),
	]

	const interOp = Fake.Interop.withMetadataCollection(Fake.MetaDataCollection.withLinkSuggestions(links))
	const settings = Fake.Settings
	settings.relativeTopFolders = [new ObsidianFolderPath('subfolder')]
	const collector = new SuggestionCollector(interOp, settings)

	const query = 'note'
	const suggestionContext = Fake.EditorSuggestionContext(query).withFile(Fake.File('folder1/subfolder/subfolder/my note in subfolder'))
	const expectedSuggestions: NoteSuggestion[] = [
		new NewNoteSuggestion(query),
		new ExistingNoteSuggestion('folder1/subfolder/subfolder/note3'),
		new ExistingNoteSuggestion('folder1/subfolder/subfolder/note4'),
	]

	const observedSuggestions = collector.getSuggestions(suggestionContext)
	expect(observedSuggestions).toIncludeSameMembers(expectedSuggestions)
})

test('It is possible to search for folders', () => {
    const loadedFoldersPaths = [
		"",
		"folder1/",
		"folder2/",
		"folder2/folder2.1/",
		"folder1/folder123/",
	]

	const fileSystem = Fake.FileSystem.withFolders(loadedFoldersPaths)
	const interOp = Fake.Interop.withFileSystem(fileSystem)
	const settings = Fake.Settings
	settings.includeFoldersInSuggestions = true
	settings.folderSuggestionSettings = {folderSuggestionMode: FolderSuggestionMode.Always, folderSuggestionTrigger: "/"}
	const collector = new SuggestionCollector(interOp, settings)

	const query = 'folder2'

	const expectedSuggestions: ISuggestion[] = [
		new NewNoteSuggestion(query),
		new FolderSuggestion(new ObsidianFolderPath("folder2/")),
		new FolderSuggestion(new ObsidianFolderPath("folder2/folder2.1/")),
	]

	const suggestionContext = Fake.EditorSuggestionContext(query)

	const observedSuggestions = collector.getSuggestions(suggestionContext)
	expect(observedSuggestions).toIncludeSameMembers(expectedSuggestions)
})

test('Notes and folders are included in the same set of suggestions', () => {
    const folderPaths = [
		"",
		"folder1",
		"folder1/folder1.2",
		"folder2"
	]

	const noteLinks = [
		Fake.LinkToExistingNote('folder1/folder1.2/note1'),
		Fake.LinkToExistingNote('folder2/note2'),
		Fake.LinkToExistingNote('my note'),
	]

	const interOp = Fake.Interop
		.withMetadataCollection(Fake.MetaDataCollection.withLinkSuggestions(noteLinks))
		.withFileSystem(Fake.FileSystem.withFolders(folderPaths))

	const settings = Fake.Settings
	settings.includeFoldersInSuggestions = true
	settings.folderSuggestionSettings = {folderSuggestionMode: FolderSuggestionMode.Always, folderSuggestionTrigger: "/"}

	const collector = new SuggestionCollector(interOp, settings)

	const query = ''

	const expectedSuggestions: ISuggestion[] = [
		new FolderSuggestion(new ObsidianFolderPath("folder1")),
		new FolderSuggestion(new ObsidianFolderPath("folder1/folder1.2")),
		new FolderSuggestion(new ObsidianFolderPath("folder2")),
		new ExistingNoteSuggestion('folder1/folder1.2/note1'),
		new ExistingNoteSuggestion('folder2/note2'),
		new ExistingNoteSuggestion('my note'),
	]

	const suggestionContext = Fake.EditorSuggestionContext(query)

	const observedSuggestions = collector.getSuggestions(suggestionContext)
	expect(observedSuggestions).toIncludeSameMembers(expectedSuggestions)
})
