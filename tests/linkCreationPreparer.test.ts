import {ExistingNoteSuggestion, NewNoteSuggestion} from "../src/core/suggestions/NoteSuggestion"
import {IConfigurationStore, IFileSystem} from "../src/interop/ObsidianInterfaces"
import {LinkCreationPreparer} from "../src/core/LinkCreationPreparer"
import {TFile} from "obsidian"
import {ObsidianFolderPath} from "../src/core/paths/ObsidianFolderPath"

const defaultConfigStore = <IConfigurationStore>{getValueFor: (s) => s === 'newFileLocation' ? 'root' : undefined}
const fakeFile = <TFile>{}

test('no file is created if the suggestion name is empty', async () => {
	const fileSystem = <IFileSystem>{ noteExists: (s) => false, folderExists: (s) => false}
	const noteCreator = new LinkCreationPreparer(fileSystem, defaultConfigStore)
	const suggestion = new NewNoteSuggestion("")

	const cmd = await noteCreator.prepareNoteCreationForEmptyNote(suggestion, fakeFile)

	expect(cmd.NoteCreationCommand).toBeFalsy()
})

describe('when the file in the suggestion exists', function () {
	const fileSystem = <IFileSystem>{ noteExists: (s) => true, folderExists: (s) => true}

	test('file and folder creation is not requested', async () => {
		const noteCreator = new LinkCreationPreparer(fileSystem, defaultConfigStore)
		const suggestion = new ExistingNoteSuggestion("my file")

		const cmd = await noteCreator.prepareNoteCreationForEmptyNote(suggestion, fakeFile)

		expect(cmd.NoteCreationCommand).toBeFalsy()
		expect(cmd.FolderCreationCommand).toBeFalsy()
	})
})

describe('when the file in the suggestion does not exist', function () {
	test('creation of the file is requested', async () => {
		const fileSystem = <IFileSystem>{ noteExists: (s) => false, folderExists: (s) => true}
		const noteCreator = new LinkCreationPreparer(fileSystem, defaultConfigStore)
		const suggestion = new NewNoteSuggestion("My Note.md")

		const cmd = await noteCreator.prepareNoteCreationForEmptyNote(suggestion, fakeFile)

		expect(cmd.NoteCreationCommand).toBeTruthy()
	})

	it.each([
		{trigger: "My note.md", expectedFilePath: "My note.md"},
		{trigger: "Some folder/My note.md", expectedFilePath: "Some folder/My note.md"},
		{trigger: "My note", expectedFilePath: "My note.md"},
		{trigger: "Some folder/My note", expectedFilePath: "Some folder/My note.md"},
		{trigger: "Some folder/My note|Some name", expectedFilePath: "Some folder/My note.md"},
	])('the correct file path is given when the trigger is $trigger', async ({trigger, expectedFilePath}) => {
		const fileSystem = <IFileSystem>{ noteExists: (s) => false, folderExists: (s) => true}
		const noteCreator = new LinkCreationPreparer(fileSystem, defaultConfigStore)
		const suggestion = new NewNoteSuggestion(trigger)

		const cmd = await noteCreator.prepareNoteCreationForEmptyNote(suggestion, fakeFile)

		expect(cmd.NoteCreationCommand.PathToNewFile).toBe(expectedFilePath)
	})

	it.each([
		{trigger: "Some folder/My note.md", expectedFolderPath: "Some folder"},
		{trigger: "Folder1/folder2/file", expectedFolderPath: "Folder1/folder2"},
		{trigger: "Some folder/My note|Some name", expectedFolderPath: "Some folder"},
	])('the correct folder path is given when the trigger is $trigger and folder creation is requested when folder does not exist', async ({trigger, expectedFolderPath: expectedFolderPath}) => {
		const fileSystem = <IFileSystem>{ noteExists: (s) => false, folderExists: (s) => false}
		const noteCreator = new LinkCreationPreparer(fileSystem, defaultConfigStore)
		const suggestion = new NewNoteSuggestion(trigger)

		const cmd = await noteCreator.prepareNoteCreationForEmptyNote(suggestion, fakeFile)

		expect(cmd.FolderCreationCommand).toBeTruthy()
		expect(cmd.FolderCreationCommand.PathToNewFolder).toStrictEqual(new ObsidianFolderPath(expectedFolderPath))
	})

	it.each([
		{trigger: "Some folder/My note.md", expectedAlias: undefined},
		{trigger: "Some folder/My note.md| My name", expectedAlias: "My name"},
		{trigger: "Folder1/folder2/file|", expectedAlias: undefined},
		{trigger: "Some folder/My note|Some name", expectedAlias: "Some name"},
	])('the correct alias is given when the trigger is $trigger', async ({trigger, expectedAlias: expectedAlias}) => {
		const fileSystem = <IFileSystem>{ noteExists: (s) => true, folderExists: (s) => true}
		const noteCreator = new LinkCreationPreparer(fileSystem, defaultConfigStore)
		const suggestion = new NewNoteSuggestion(trigger)

		const cmd = await noteCreator.prepareNoteCreationForEmptyNote(suggestion, fakeFile)

		expect(cmd.NoteAlias).toBe(expectedAlias)
	})

	test('creation of missing folders in the link path are not requested if they do exist', async () => {
		const fileSystem = <IFileSystem>{ noteExists: (s) => false, folderExists: (s) => true}
		const noteCreator = new LinkCreationPreparer(fileSystem, defaultConfigStore)
		const suggestion = new NewNoteSuggestion('my/non/existing folder/with a note')

		const cmd = await noteCreator.prepareNoteCreationForEmptyNote(suggestion, fakeFile)

		expect(cmd.FolderCreationCommand).toBeFalsy()
	})

	test('creation of a folder is not created if the suggestion is for a note in the root folder', async () => {
		const fileSystem = <IFileSystem>{ noteExists: (s) => false, folderExists: (s) => false}
		const noteCreator = new LinkCreationPreparer(fileSystem, defaultConfigStore)
		const suggestion = new NewNoteSuggestion('my note in the root')

		const cmd = await noteCreator.prepareNoteCreationForEmptyNote(suggestion, fakeFile)

		expect(cmd.FolderCreationCommand).toBeFalsy()
	})

	test('the file will be empty', async () => {
		const fileSystem = <IFileSystem>{ noteExists: (s) => false, folderExists: (s) => true}
		const noteCreator = new LinkCreationPreparer(fileSystem, defaultConfigStore)
		const suggestion = new NewNoteSuggestion('My note.md')

		const cmd = await noteCreator.prepareNoteCreationForEmptyNote(suggestion, fakeFile)

		expect(cmd.NoteCreationCommand.NoteContent).toBe('')
	})

	describe('and the default new note location is "current"', function () {
		it.each([
			{triggerText: "my new note", triggeredIn: 'some note', expectedVaultPath: 'my new note.md'},
			{triggerText: "my new note", triggeredIn: 'folder/some note', expectedVaultPath: 'folder/my new note.md'},
			{triggerText: "my new note", triggeredIn: 'folder1/folder2/some note', expectedVaultPath: 'folder1/folder2/my new note.md'},
			{triggerText: "/my new note", triggeredIn: 'folder/some note', expectedVaultPath: '/my new note.md'},
			{triggerText: "folder23/my new note", triggeredIn: 'folder/some note', expectedVaultPath: 'folder23/my new note.md'},
		])('the new note is added with vault path $expectedVaultPath when link insertion is triggered in $triggeredIn and the trigger text is $triggerText',
			async ({triggerText, triggeredIn, expectedVaultPath}) => {
				const configStore = <IConfigurationStore>{getValueFor: (s) => s === 'newFileLocation' ? 'current' : undefined}
				const fileSystem = <IFileSystem>{ noteExists: (s) => false, folderExists: (s) => true}
				const noteCreator = new LinkCreationPreparer(fileSystem, configStore)
				const suggestion = new NewNoteSuggestion(triggerText)
				const expected = new NewNoteSuggestion(expectedVaultPath)
				const file = <TFile>{path: triggeredIn}

				const cmd = await noteCreator.prepareNoteCreationForEmptyNote(suggestion, file)

				expect(cmd.NoteCreationCommand.PathToNewFile).toBe(expected.VaultPath)
			})
	})

	describe('and the default new note location is "root"', function () {
		it.each([
			{triggerText: "my new note", triggeredIn: 'some note', expectedVaultPath: 'my new note.md'},
			{triggerText: "my new note", triggeredIn: 'folder/some note', expectedVaultPath: 'my new note.md'},
			{triggerText: "my new note", triggeredIn: 'folder1/folder2/some note', expectedVaultPath: 'my new note.md'},
			{triggerText: "/my new note", triggeredIn: 'folder/some note', expectedVaultPath: '/my new note.md'},
			{triggerText: "folder23/my new note", triggeredIn: 'folder/some note', expectedVaultPath: 'folder23/my new note.md'},
		])('the new note is added with vault path $expectedVaultPath when link insertion is triggered in $triggeredIn and the trigger text is $triggerText',
			async ({triggerText, triggeredIn, expectedVaultPath}) => {
				const configStore = <IConfigurationStore>{getValueFor: (s) => s === 'newFileLocation' ? 'root' : undefined}
				const fileSystem = <IFileSystem>{ noteExists: (s) => false, folderExists: (s) => true}
				const noteCreator = new LinkCreationPreparer(fileSystem, configStore)
				const suggestion = new NewNoteSuggestion(triggerText)
				const expected = new NewNoteSuggestion(expectedVaultPath)
				const file = <TFile>{path: triggeredIn}

				const cmd = await noteCreator.prepareNoteCreationForEmptyNote(suggestion, file)

				expect(cmd.NoteCreationCommand.PathToNewFile).toBe(expected.VaultPath)
			})
	})

	describe('and the default new note location is "folder"', function () {
		it.each([
			{defaultFolder: 'folder10', triggerText: "my new note", triggeredIn: 'some note', expectedVaultPath: 'folder10/my new note.md'},
			{defaultFolder: 'Capital folder', triggerText: "my new note", triggeredIn: 'some note', expectedVaultPath: 'Capital folder/my new note.md'},
			{defaultFolder: '', triggerText: "my new note", triggeredIn: 'some note', expectedVaultPath: 'my new note.md'},
			{defaultFolder: undefined, triggerText: "my new note", triggeredIn: 'some note', expectedVaultPath: 'my new note.md'},
			{defaultFolder: 'folder23', triggerText: "my new note", triggeredIn: 'folder/some note', expectedVaultPath: 'folder23/my new note.md'},
			{defaultFolder: 'folder1/folder2', triggerText: "my new note", triggeredIn: 'folder1/folder2/some note', expectedVaultPath: 'folder1/folder2/my new note.md'},
			{defaultFolder: 'folder6', triggerText: "/my new note", triggeredIn: 'folder/some note', expectedVaultPath: '/my new note.md'},
			{defaultFolder: 'folder2', triggerText: "folder23/my new note", triggeredIn: 'folder/some note', expectedVaultPath: 'folder23/my new note.md'},
		])('the new note is added with vault path $expectedVaultPath when link insertion is triggered in $triggeredIn, the default folder is $defaultFolder, and the trigger text is $triggerText',
			async ({triggerText, triggeredIn, expectedVaultPath, defaultFolder}) => {
				const configStore = <IConfigurationStore>{
					getValueFor: (s) => {
						switch (s) {
							case 'newFileLocation': return 'folder'
							case 'newFileFolderPath': return defaultFolder
							default: return undefined
						}
					}
				}
				const fileSystem = <IFileSystem>{ noteExists: (s) => false, folderExists: (s) => s.VaultPath === defaultFolder}
				const noteCreator = new LinkCreationPreparer(fileSystem, configStore)
				const suggestion = new NewNoteSuggestion(triggerText)
				const expected = new NewNoteSuggestion(expectedVaultPath)
				const file = <TFile>{path: triggeredIn}

				const cmd = await noteCreator.prepareNoteCreationForEmptyNote(suggestion, file)

				expect(cmd.NoteCreationCommand.PathToNewFile).toBe(expected.VaultPath)
			})

		test('note is created in root if the folder does not exist', async () => {
			const defaultFolder = 'folder1'
			const configStore = <IConfigurationStore>{
				getValueFor: (s) => {
					switch (s) {
						case 'newFileLocation': return 'folder'
						case 'newFileFolderPath': return defaultFolder
						default: return undefined
					}
				}
			}
			const fileSystem = <IFileSystem>{ noteExists: (s) => false, folderExists: (s) => false}
			const noteCreator = new LinkCreationPreparer(fileSystem, configStore)
			const suggestion = new NewNoteSuggestion('note1.md')

			const cmd = await noteCreator.prepareNoteCreationForEmptyNote(suggestion, fakeFile)

			expect(cmd.NoteCreationCommand.PathToNewFile).toBe(suggestion.VaultPath)
		})
	})
})
