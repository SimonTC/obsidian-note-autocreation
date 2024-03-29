import {ObsidianFolderPath} from "../src/core/paths/ObsidianFolderPath"
import {ObsidianFilePath} from "../src/core/paths/ObsidianFilePath"

describe('a single Obsidian folder path', function () {
	it.each([
		{path: 'folder1/folder2', expectedFolderPath: 'folder1/folder2'},
		{path: 'folder1/folder2/', expectedFolderPath: 'folder1/folder2/'},
		{path: 'Folder1/fOlder2/', expectedFolderPath: 'Folder1/fOlder2/'}, // Capitalized
		{path: 'folder2', expectedFolderPath: 'folder2'},
		{path: '', expectedFolderPath: ''},
		{path: '/', expectedFolderPath: '/'},
	])('has correct vault path when path is $path', ({path, expectedFolderPath: expectedVaultPath}) => {
		const obsidianPath = new ObsidianFolderPath(path)

		expect(obsidianPath.VaultPath).toBe(expectedVaultPath)
	})

	it.each([
		{path: 'folder1/folder2/', expectedTitle: 'folder2'},
		{path: '/folder1/', expectedTitle: 'folder1'},
		{path: 'testfolder', expectedTitle: 'testfolder'},
		{path: 'Test Folder', expectedTitle: 'Test Folder'}, // Capitalized
		{path: 'folder1/folder2', expectedTitle: 'folder2'},
		{path: '', expectedTitle: ''},
		{path: '/', expectedTitle: ''},
	])('uses title $expectedTitle when path is $path', ({path, expectedTitle}) => {
		const obsidianPath = new ObsidianFolderPath(path)

		expect(obsidianPath.Title).toBe(expectedTitle)
	})

	it.each([
		{path: ''},
		{path: '/'},
	])('is root when path is $path', ({path}) => {
		const obsidianPath = new ObsidianFolderPath(path)

		expect(obsidianPath.IsRoot).toBe(true)
	})

	it.each([
		{path: 'folder1/'},
		{path: '/folder1/folder2'},
	])('is not root when path is $path', ({path}) => {
		const obsidianPath = new ObsidianFolderPath(path)

		expect(obsidianPath.IsRoot).toBe(false)
	})
})

describe('isAncestorOf', function () {
	it.each([
		{folderPath: 'folder1/', otherPath: 'folder2/', expected: false},
		{folderPath: 'folder1/', otherPath: 'folder1/folder2/', expected: true},
		{folderPath: 'folder1/', otherPath: 'Folder1/folder2/', expected: true}, // Capitalization should not matter
		{folderPath: 'Folder1/', otherPath: 'folder1/folder2/', expected: true}, // Capitalization should not matter
		{folderPath: '/', otherPath: 'folder1/folder2/', expected: true},
		{folderPath: '/', otherPath: 'folder2/', expected: true},
		{folderPath: '', otherPath: 'folder2/', expected: true},
		{folderPath: '', otherPath: '/folder2/', expected: true},
		{folderPath: 'folder1/folder2/', otherPath: 'folder1/folder2/folder3/folder4/', expected: true},
		{folderPath: 'myFolder/', otherPath: 'other folder/MyFolder/Folder1/', expected: false},

	])('is $expected when folder path is $folderPath and other folder path is $otherPath', ({folderPath, otherPath, expected}) => {
		const obsidianPath = new ObsidianFolderPath(folderPath)
		const toCheck = new ObsidianFolderPath(otherPath)

		expect(obsidianPath.isAncestorOf(toCheck)).toBe(expected)
	})

	it.each([
		{folderPath: 'folder1/', otherPath: 'some note', expected: false},
		{folderPath: 'folder1/', otherPath: 'folder1/folder2/some note', expected: true},
		{folderPath: 'Folder1/', otherPath: 'folder1/folder2/some note', expected: true}, // Capitalization should not matter
		{folderPath: 'folder1/', otherPath: 'Folder1/folder2/some note', expected: true}, // Capitalization should not matter
		{folderPath: '/', otherPath: 'folder1/note', expected: true},
		{folderPath: '/', otherPath: 'note', expected: true},
		{folderPath: '/', otherPath: '/note', expected: true},
		{folderPath: '', otherPath: '/note', expected: true},
		{folderPath: '', otherPath: 'note', expected: true},
		{folderPath: '', otherPath: 'folder2/note', expected: true},
		{folderPath: '', otherPath: '/folder2/note', expected: true},
		{folderPath: 'folder1/folder2/', otherPath: 'folder1/folder2/folder3/note', expected: true},
		{folderPath: 'myFolder/', otherPath: 'other folder/MyFolder/Folder1/note.md', expected: false},

	])('is $expected when folder path is $folderPath and other file path is $otherPath', ({folderPath, otherPath, expected}) => {
		const obsidianPath = new ObsidianFolderPath(folderPath)
		const toCheck = new ObsidianFilePath(otherPath)

		expect(obsidianPath.isAncestorOf(toCheck)).toBe(expected)
	})
})

describe('getParentOrThis', function () {
	test('returns itself when folder is root', () => {
		const path = new ObsidianFolderPath('')
		expect(path.getParentOrThis().VaultPath).toBe('')
	})

	it.each([
		{folderPath: "folder1", expectedParentPath: ''},
		{folderPath: "folder1/folder2", expectedParentPath: 'folder1'},
		{folderPath: "Folder1/folder2", expectedParentPath: 'Folder1'}
	])('returns "$expectedParentPath" when folder path is "$folderPath"', ({folderPath, expectedParentPath}) => {
		const path = new ObsidianFolderPath(folderPath)
		expect(path.getParentOrThis().VaultPath).toBe(expectedParentPath)
	})
})
