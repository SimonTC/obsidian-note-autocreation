import {Suggestion} from "../src/Suggestion";
import {IFileSystem} from "../src/ObsidianInterfaces";
import {NoteCreationPreparer} from "../src/NoteCreationPreparer";

test('no file is created if the suggestion name is empty', () => {
	const fileSystem = <IFileSystem>{ noteExists: (s) => false, folderExists: (s) => false};
	const noteCreator = new NoteCreationPreparer(fileSystem)
	const suggestion = new Suggestion("")

	const cmd = noteCreator.prepareNoteCreationFor(suggestion)

	expect(cmd.FileCreationNeeded).toBeFalsy()
})

describe('when the file in the suggestion exists', function () {
	const fileSystem = <IFileSystem>{ noteExists: (s) => true, folderExists: (s) => true};

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
		const fileSystem = <IFileSystem>{ noteExists: (s) => false, folderExists: (s) => true};
		const noteCreator = new NoteCreationPreparer(fileSystem)
		const suggestion = new Suggestion("My Note.md")

		const cmd = noteCreator.prepareNoteCreationFor(suggestion)

		expect(cmd.FileCreationNeeded).toBeTruthy()
	})

	it.each([
		{vaultPath: "My note.md", expectedFilePath: "My note.md"},
		{vaultPath: "Some folder/My note.md", expectedFilePath: "Some folder/My note.md"},
		{vaultPath: "My note", expectedFilePath: "My note.md"},
		{vaultPath: "Some folder/My note", expectedFilePath: "Some folder/My note.md"},
	])('the correct file path is given when the vault path is $vaultPath', ({vaultPath, expectedFilePath}) => {
		const fileSystem = <IFileSystem>{ noteExists: (s) => false, folderExists: (s) => true};
		const noteCreator = new NoteCreationPreparer(fileSystem)
		const suggestion = new Suggestion(vaultPath)

		const cmd = noteCreator.prepareNoteCreationFor(suggestion)

		expect(cmd.PathToNewFile).toBe(expectedFilePath)
	})

	test('creation of missing folders in the link path are requested if they do not exist', () => {
		const fileSystem = <IFileSystem>{ noteExists: (s) => false, folderExists: (s) => false};
		const noteCreator = new NoteCreationPreparer(fileSystem)
		const suggestion = new Suggestion('my/non/existing folder/with a note')

		const cmd = noteCreator.prepareNoteCreationFor(suggestion)

		expect(cmd.FolderCreationNeeded).toBe(true)
		expect(cmd.PathToNewFolder).toBe('my/non/existing folder')
	})

	test('creation of missing folders in the link path are not requested if they do exist', () => {
		const fileSystem = <IFileSystem>{ noteExists: (s) => false, folderExists: (s) => true};
		const noteCreator = new NoteCreationPreparer(fileSystem)
		const suggestion = new Suggestion('my/non/existing folder/with a note')

		const cmd = noteCreator.prepareNoteCreationFor(suggestion)

		expect(cmd.FolderCreationNeeded).toBeFalsy()
	})

	test('creation of a folder is not created if the suggestion is for a note in the root folder', () => {
		const fileSystem = <IFileSystem>{ noteExists: (s) => false, folderExists: (s) => false};
		const noteCreator = new NoteCreationPreparer(fileSystem)
		const suggestion = new Suggestion('my note in the root')

		const cmd = noteCreator.prepareNoteCreationFor(suggestion)

		expect(cmd.FolderCreationNeeded).toBeFalsy()
	})

	test('the file will contain the suggestion title as header 1', () => {
		const fileSystem = <IFileSystem>{ noteExists: (s) => false, folderExists: (s) => true};
		const noteCreator = new NoteCreationPreparer(fileSystem)
		const suggestion = new Suggestion('My note.md')

		const cmd = noteCreator.prepareNoteCreationFor(suggestion)

		expect(cmd.NoteContent).toBe('# My note')
	})
});
