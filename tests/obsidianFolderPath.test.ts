import {ObsidianFolderPath} from "../src/core/paths/ObsidianFolderPath"


describe('a single Obsidian folder path', function () {
	it.each([
		{path: 'folder1/folder2', expectedFolderPath: 'folder1/folder2'},
		{path: 'folder1/folder2/', expectedFolderPath: 'folder1/folder2/'},
		{path: 'folder2', expectedFolderPath: 'folder2'},
		{path: '', expectedFolderPath: ''},
		{path: '/', expectedFolderPath: '/'},
	])('has correct vault path when path is $path', ({path, expectedFolderPath: expectedVaultPath}) => {
		const obsidianPath = new ObsidianFolderPath(path)

		expect(obsidianPath.VaultPath).toBe(expectedVaultPath)
	})

	it.each([
		{path: 'folder1/folder2', expectedTitle: 'folder2'},
		{path: 'folder1/folder2/', expectedTitle: ''},
		{path: '/folder1', expectedTitle: 'folder1'},
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
