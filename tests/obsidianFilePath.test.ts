import {ObsidianFilePath} from "../src/core/paths/ObsidianFilePath"

describe('a single Obsidian file path', function () {
	it.each([
		{path: 'folder1/folder2/mynote.md', expectedFolderPath: 'folder1/folder2'},
		{path: 'folder1/folder2/note 1|other name', expectedFolderPath: 'folder1/folder2'},
		{path: 'folder2/mynote.md', expectedFolderPath: 'folder2'},
		{path: 'mynote.md', expectedFolderPath: ''},
		{path: '/', expectedFolderPath: ''},
	])('does not contain file name in folder path when path is $path', ({path, expectedFolderPath}) => {
		const obsidianPath = new ObsidianFilePath(path)

		expect(obsidianPath.FolderPath).toBe(expectedFolderPath)
	})

	it.each([
		{path: 'folder1/folder2/mynote.md', expectedTitle: 'mynote'}, // normal link
		{path: 'folder1/folder2/some note', expectedTitle: 'some note'}, // link without extension
		{path: 'folder1/folder2/with some extension.exe', expectedTitle: 'with some extension'}, // link with other extension
	])('uses title $expectedTitle when path is $path', ({path, expectedTitle}) => {
		const obsidianPath = new ObsidianFilePath(path)

		expect(obsidianPath.Title).toBe(expectedTitle)
	})

	it.each([
		{path: 'folder1/folder2/.md'},
		{path: 'folder1/'},
		{path: 'folder1/.exe'},
		{path: ''},
		{path: '/'},
	])('has empty title when path is $path', ({path}) => {
		const obsidianPath = new ObsidianFilePath(path)

		expect(obsidianPath.Title).toBe('')
	})

	it.each([
		{path: ' folder1/folder2/file.md', expected: 'folder1/folder2/file.md'},
		{path: 'folder1/note ', expected: 'folder1/note'},
		{path: ' folder/name ', expected: 'folder/name'},
	])('has no extra white space in vault path when path is $path', ({path, expected}) => {
		const obsidianPath = new ObsidianFilePath(path)

		expect(obsidianPath.VaultPath).toBe(expected)
	})

	it.each([
		{path: 'folder1/folder2/file.md', expectedExtension: 'md'},
		{path: 'folder1/note', expectedExtension: ""},
		{path: 'folder1/note.', expectedExtension: ""},
		{path: 'folder1/folder2/', expectedExtension: ""},
		{path: 'folder/name.txt', expectedExtension: 'txt'},
	])('stores extension as $expectedExtension when path is $path', ({path, expectedExtension}) => {
		const obsidianPath = new ObsidianFilePath(path)

		expect(obsidianPath.Extension).toBe(expectedExtension)
	})

	it.each([
		{path: 'folder1/folder2/file.md', expected: 'file.md'},
		{path: 'folder1/note', expected: 'note'},
		{path: 'folder1/note.', expected: 'note.'},
		{path: 'folder1/folder2/', expected: ''},
		{path: 'folder/name.txt', expected: 'name.txt'},
	])('stores title with possible extension as $expected when path is $path', ({path, expected}) => {
		const obsidianPath = new ObsidianFilePath(path)

		expect(obsidianPath.FileNameWithPossibleExtension).toBe(expected)
	})

	it.each([
		{path: ' folder1/folder2/file.md', expected: 'folder1/folder2/file.md'}, // space before trigger
		{path: 'folder1/note ', expected: 'folder1/note'}, // space after trigger
		{path: ' folder/name ', expected: 'folder/name'}, // space before and after the trigger
		{path: 'myNote.md', expected: 'myNote.md'}, // file with markdown extension
		{path: 'myImage.png', expected: 'myImage.png'}, // file with other extension
		{path: 'myNote', expected: 'myNote'}, // file without extension
		{path: 'folder1/folder2/folder3/', expected: 'folder1/folder2/folder3/'}, // only folder
	])('stores vault path as $expected when path is $path', ({path, expected}) => {
		const obsidianPath = new ObsidianFilePath(path)

		expect(obsidianPath.VaultPath).toBe(expected)
	})

	test('does not include alias', () => {
		const path = 'folder1/folder3/my file.exe|this is my alias'
		const obsidianPath = new ObsidianFilePath(path)

		const expectedPath = {
			VaultPath: 'folder1/folder3/my file.exe',
			VaultPathWithoutExtension: 'folder1/folder3/my file',
			Title: 'my file',
			FolderPath: 'folder1/folder3',
			NoteIsInRoot: false,
			Extension: 'exe',
			FileNameWithPossibleExtension: 'my file.exe'
		}

		expect(obsidianPath).toEqual(expectedPath)

	})

	test('does not include link to header', () => {
		const path = 'folder1/folder3/my file.exe#some header'
		const obsidianPath = new ObsidianFilePath(path)

		const expectedPath = {
			VaultPath: 'folder1/folder3/my file.exe',
			VaultPathWithoutExtension: 'folder1/folder3/my file',
			Title: 'my file',
			FolderPath: 'folder1/folder3',
			NoteIsInRoot: false,
			Extension: 'exe',
			FileNameWithPossibleExtension: 'my file.exe'
		}

		expect(obsidianPath).toEqual(expectedPath)
	})

	test('will not add extension to a path', () => {
		const obsidianPath = new ObsidianFilePath('my file')
		const expectedPath = {
			VaultPath: 'my file',
			VaultPathWithoutExtension: 'my file',
			Title: 'my file',
			FolderPath: '',
			NoteIsInRoot: true,
			Extension: '',
			FileNameWithPossibleExtension: 'my file'
		}

		expect(obsidianPath).toEqual(expectedPath)
	})

	test('can deal with dots in folder name', () => {
		const fullPath = '000 - Folder. Inbox. Subfolder/_Templates/my note'
		const obsidianPath = new ObsidianFilePath(fullPath)
		const expectedPath = {
			VaultPath: '000 - Folder. Inbox. Subfolder/_Templates/my note',
			VaultPathWithoutExtension: '000 - Folder. Inbox. Subfolder/_Templates/my note',
			Title: 'my note',
			FolderPath: '000 - Folder. Inbox. Subfolder/_Templates',
			NoteIsInRoot: false,
			Extension: '',
			FileNameWithPossibleExtension: 'my note'
		}

		expect(obsidianPath).toEqual(expectedPath)
	})

	test('can deal with dots in file name', () => {
		const fullPath = '/_Templates/folder.with.dots/my note.is.awesome.md'
		const obsidianPath = new ObsidianFilePath(fullPath)
		const expectedPath = {
			VaultPath: '/_Templates/folder.with.dots/my note.is.awesome.md',
			VaultPathWithoutExtension: '/_Templates/folder.with.dots/my note.is.awesome',
			Title: 'my note.is.awesome',
			FolderPath: '/_Templates/folder.with.dots',
			NoteIsInRoot: false,
			Extension: 'md',
			FileNameWithPossibleExtension: 'my note.is.awesome.md'
		}

		expect(obsidianPath).toEqual(expectedPath)
	})
})
