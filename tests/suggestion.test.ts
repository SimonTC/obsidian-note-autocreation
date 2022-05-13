import {Suggestion} from "../src/Suggestion";

describe('a single suggestion', function () {
	it.each([
		{trigger: 'folder1/folder2/mynote.md', expectedFolderPath: 'folder1/folder2'},
		{trigger: 'folder1/folder2/note 1|other name', expectedFolderPath: 'folder1/folder2'},
		{trigger: 'folder2/mynote.md', expectedFolderPath: 'folder2'},
		{trigger: 'mynote.md', expectedFolderPath: ''},
		{trigger: '/', expectedFolderPath: ''},
	])('does not contain file name in folder path when trigger is $trigger', ({trigger, expectedFolderPath}) => {
		const suggestion = new Suggestion(trigger);

		expect(suggestion.FolderPath).toBe(expectedFolderPath)
	})

	it.each([
		{trigger: 'folder1/folder2/mynote.md', expectedTitle: 'mynote'}, // normal link
		{trigger: 'folder1/folder2/some note', expectedTitle: 'some note'}, // link without extension
		{trigger: 'folder1/folder2/with some extension.exe', expectedTitle: 'with some extension'}, // wrong extension given
		{trigger: 'My note|With another name', expectedTitle: 'My note'}, // alias given
		{trigger: 'My note.md|With another name', expectedTitle: 'My note'}, // alias given with extension in path
	])('uses title $expectedTitle when trigger is $trigger', ({trigger, expectedTitle}) => {
		const suggestion = new Suggestion(trigger);

		expect(suggestion.Title).toBe(expectedTitle)
	})

	it.each([
		{trigger: 'folder1/folder2/.md'},
		{trigger: 'folder1/'},
		{trigger: ''},
		{trigger: '/'},
		{trigger: '/|some non empty name'},
	])('has empty title when trigger is $trigger', ({trigger}) => {
		const suggestion = new Suggestion(trigger);

		expect(suggestion.Title).toBe('')
	})

	it.each([
		{trigger: ' folder1/folder2/file.md', expected: 'folder1/folder2/file.md'},
		{trigger: 'folder1/note ', expected: 'folder1/note'},
		{trigger: ' folder/name ', expected: 'folder/name'},
	])('has no extra white space in trigger when trigger is $trigger', ({trigger, expected}) => {
		const suggestion = new Suggestion(trigger);

		expect(suggestion.Trigger).toBe(expected)
	})

	it.each([
		{trigger: ' folder1/folder2/file.md', expected: 'folder1/folder2/file.md'}, // space before trigger
		{trigger: 'folder1/note ', expected: 'folder1/note'}, // space after trigger
		{trigger: ' folder/name ', expected: 'folder/name'}, // space before and after the trigger
		{trigger: 'folder1/myNote|With another name', expected: 'folder1/myNote'}, // alias included
		{trigger: 'myNote.md', expected: 'myNote.md'}, // file with extension
		{trigger: 'myNote', expected: 'myNote'}, // file without extension
		{trigger: 'folder1/folder2/folder3/', expected: 'folder1/folder2/folder3/'}, // only folder
	])('stores vault path as $expected when trigger is $trigger', ({trigger, expected}) => {
		const suggestion = new Suggestion(trigger);

		expect(suggestion.VaultPath).toBe(expected)
	})

	it.each([
		{trigger: 'folder1/folder2/mynote.md'},
		{trigger: 'folder1/folder2/some note'},
		{trigger: 'reading/books/short-stories/how I Won.md'},
		{trigger: 'note.md'},
	])('stores $trigger as trigger', ({trigger}) => {
		const suggestion = new Suggestion(trigger);

		expect(suggestion.Trigger).toBe(trigger)
	})

	it.each([
		{trigger: 'folder1/myNote|With another name', expectedAlias: 'With another name'},
		{trigger: 'My nice note|With another name', expectedAlias: 'With another name'},
		{trigger: 'My nice note|', expectedAlias: undefined},
		{trigger: 'My nice note', expectedAlias: undefined},
	])('uses alias $expectedAlias when trigger $trigger is given', ({trigger, expectedAlias}) => {
		const suggestion = new Suggestion(trigger);
		expect(suggestion.Alias).toBe(expectedAlias)
	})
});
