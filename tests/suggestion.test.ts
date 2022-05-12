import {Suggestion} from "../src/Suggestion";

describe('a single suggestion', function () {
	it.each([
		{vaultPath: 'folder1/folder2/mynote.md', expectedFolderPath: 'folder1/folder2'},
		{vaultPath: 'folder1/folder2/note 1|other name', expectedFolderPath: 'folder1/folder2'},
		{vaultPath: 'folder2/mynote.md', expectedFolderPath: 'folder2'},
		{vaultPath: 'mynote.md', expectedFolderPath: ''},
	])('does not contain file name in folder path when vault path is $vaultPath', ({vaultPath, expectedFolderPath}) => {
		const suggestion = new Suggestion(vaultPath);

		expect(suggestion.FolderPath).toBe(expectedFolderPath)
	})

	it.each([
		{vaultPath: 'folder1/folder2/mynote.md', expectedTitle: 'mynote'}, // normal link
		{vaultPath: 'folder1/folder2/some note', expectedTitle: 'some note'}, // link without extension
		{vaultPath: 'folder1/folder2/with some extension.exe', expectedTitle: 'with some extension'}, // wrong extension given
		{vaultPath: 'My note|With another name', expectedTitle: 'My note'}, // alias given
		{vaultPath: 'My note.md|With another name', expectedTitle: 'My note'}, // alias given with extension in path
	])('uses title $expectedTitle when vault path is $vaultPath', ({vaultPath, expectedTitle}) => {
		const suggestion = new Suggestion(vaultPath);

		expect(suggestion.Title).toBe(expectedTitle)
	})

	it.each([
		{vaultPath: 'folder1/folder2/.md'},
		{vaultPath: 'folder1/'},
		{vaultPath: ''},
		{vaultPath: '/'},
		{vaultPath: '/|some non empty name'},
	])('has empty title when vault path is $vaultPath', ({vaultPath}) => {
		const suggestion = new Suggestion(vaultPath);

		expect(suggestion.Title).toBe('')
	})

	it.each([
		{vaultPath: ' folder1/folder2/file.md', expected: 'folder1/folder2/file.md'},
		{vaultPath: 'folder1/note ', expected: 'folder1/note'},
		{vaultPath: ' folder/name ', expected: 'folder/name'},
	])('has no extra white space in paths when vault path is $vaultPath', ({vaultPath, expected}) => {
		const suggestion = new Suggestion(vaultPath);

		expect(suggestion.VaultPath).toBe(expected)
	})

	it.each([
		{vaultPath: 'folder1/folder2/mynote.md'},
		{vaultPath: 'folder1/folder2/some note'},
		{vaultPath: 'reading/books/short-stories/how I Won.md'},
		{vaultPath: 'note.md'},
		{vaultPath: 'folder1/myNote|With another name'},
	])('stores $vaultPath as vault path', ({vaultPath}) => {
		const suggestion = new Suggestion(vaultPath);

		expect(suggestion.VaultPath).toBe(vaultPath)
	})

	it.each([
		{vaultPath: 'folder1/myNote|With another name', expectedAlias: 'With another name'},
		{vaultPath: 'My nice note|With another name', expectedAlias: 'With another name'},
		{vaultPath: 'My nice note|', expectedAlias: undefined},
		{vaultPath: 'My nice note', expectedAlias: undefined},
	])('uses alias $expectedAlias when vault path $vaultPath is given', ({vaultPath, expectedAlias}) => {
		const suggestion = new Suggestion(vaultPath);
		expect(suggestion.Alias).toBe(expectedAlias)
	})
});
