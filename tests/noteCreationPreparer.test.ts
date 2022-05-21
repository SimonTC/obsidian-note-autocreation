import {Suggestion} from "../src/core/Suggestion"
import {IFileSystem} from "../src/interop/ObsidianInterfaces"
import {NoteCreationPreparer} from "../src/core/NoteCreationPreparer"

test('no file is created if the suggestion name is empty', () => {
	const fileSystem = <IFileSystem>{ noteExists: (s) => false, folderExists: (s) => false}
	const noteCreator = new NoteCreationPreparer(fileSystem)
	const suggestion = new Suggestion("")

	const cmd = noteCreator.prepareNoteCreationFor(suggestion)

	expect(cmd.FileCreationNeeded).toBeFalsy()
})

describe('when the file in the suggestion exists', function () {
	const fileSystem = <IFileSystem>{ noteExists: (s) => true, folderExists: (s) => true}

	test('file and folder creation is not requested', () => {
		const noteCreator = new NoteCreationPreparer(fileSystem)
		const suggestion = new Suggestion("my file")

		const cmd = noteCreator.prepareNoteCreationFor(suggestion)

		expect(cmd.FileCreationNeeded).toBeFalsy()
		expect(cmd.FolderCreationNeeded).toBeFalsy()
	})
})

describe('when the file in the suggestion does not exist', function () {
	test('creation of the file is requested', () => {
		const fileSystem = <IFileSystem>{ noteExists: (s) => false, folderExists: (s) => true}
		const noteCreator = new NoteCreationPreparer(fileSystem)
		const suggestion = new Suggestion("My Note.md")

		const cmd = noteCreator.prepareNoteCreationFor(suggestion)

		expect(cmd.FileCreationNeeded).toBeTruthy()
	})

	it.each([
		{trigger: "My note.md", expectedFilePath: "My note.md"},
		{trigger: "Some folder/My note.md", expectedFilePath: "Some folder/My note.md"},
		{trigger: "My note", expectedFilePath: "My note.md"},
		{trigger: "Some folder/My note", expectedFilePath: "Some folder/My note.md"},
		{trigger: "Some folder/My note|Some name", expectedFilePath: "Some folder/My note.md"},
	])('the correct file path is given when the trigger is $trigger', ({trigger, expectedFilePath}) => {
		const fileSystem = <IFileSystem>{ noteExists: (s) => false, folderExists: (s) => true}
		const noteCreator = new NoteCreationPreparer(fileSystem)
		const suggestion = new Suggestion(trigger)

		const cmd = noteCreator.prepareNoteCreationFor(suggestion)

		expect(cmd.PathToNewFile).toBe(expectedFilePath)
	})

	it.each([
		{trigger: "Some folder/My note.md", expectedFolderPath: "Some folder"},
		{trigger: "Folder1/folder2/file", expectedFolderPath: "Folder1/folder2"},
		{trigger: "Some folder/My note|Some name", expectedFolderPath: "Some folder"},
	])('the correct folder path is given when the trigger is $trigger and folder creation is requested when folder does not exist', ({trigger, expectedFolderPath: expectedFolderPath}) => {
		const fileSystem = <IFileSystem>{ noteExists: (s) => false, folderExists: (s) => false}
		const noteCreator = new NoteCreationPreparer(fileSystem)
		const suggestion = new Suggestion(trigger)

		const cmd = noteCreator.prepareNoteCreationFor(suggestion)

		expect(cmd.FolderCreationNeeded).toBe(true)
		expect(cmd.PathToNewFolder).toBe(expectedFolderPath)
	})

	it.each([
		{trigger: "Some folder/My note.md", expectedAlias: undefined},
		{trigger: "Some folder/My note.md| My name", expectedAlias: "My name"},
		{trigger: "Folder1/folder2/file|", expectedAlias: undefined},
		{trigger: "Some folder/My note|Some name", expectedAlias: "Some name"},
	])('the correct alias is given when the trigger is $trigger', ({trigger, expectedAlias: expectedAlias}) => {
		const fileSystem = <IFileSystem>{ noteExists: (s) => true, folderExists: (s) => true}
		const noteCreator = new NoteCreationPreparer(fileSystem)
		const suggestion = new Suggestion(trigger)

		const cmd = noteCreator.prepareNoteCreationFor(suggestion)

		expect(cmd.Alias).toBe(expectedAlias)
	})

	test('creation of missing folders in the link path are not requested if they do exist', () => {
		const fileSystem = <IFileSystem>{ noteExists: (s) => false, folderExists: (s) => true}
		const noteCreator = new NoteCreationPreparer(fileSystem)
		const suggestion = new Suggestion('my/non/existing folder/with a note')

		const cmd = noteCreator.prepareNoteCreationFor(suggestion)

		expect(cmd.FolderCreationNeeded).toBeFalsy()
	})

	test('creation of a folder is not created if the suggestion is for a note in the root folder', () => {
		const fileSystem = <IFileSystem>{ noteExists: (s) => false, folderExists: (s) => false}
		const noteCreator = new NoteCreationPreparer(fileSystem)
		const suggestion = new Suggestion('my note in the root')

		const cmd = noteCreator.prepareNoteCreationFor(suggestion)

		expect(cmd.FolderCreationNeeded).toBeFalsy()
	})

	test('the file will be empty', () => {
		const fileSystem = <IFileSystem>{ noteExists: (s) => false, folderExists: (s) => true}
		const noteCreator = new NoteCreationPreparer(fileSystem)
		const suggestion = new Suggestion('My note.md')

		const cmd = noteCreator.prepareNoteCreationFor(suggestion)

		expect(cmd.NoteContent).toBe('')
	})
})
