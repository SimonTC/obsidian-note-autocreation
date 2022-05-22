import {Suggestion} from "../src/core/Suggestion"

describe('a single suggestion', function () {
	it.each([
		{trigger: 'folder1/folder2/mynote.md'},
		{trigger: 'folder1/folder2/some note'},
		{trigger: 'reading/books/short-stories/how I Won.md'},
		{trigger: 'note.md'},
	])('stores $trigger as trigger', ({trigger}) => {
		const suggestion = new Suggestion(trigger)

		expect(suggestion.Trigger).toBe(trigger)
	})

	it.each([
		{trigger: 'folder1/myNote|With another name', expectedAlias: 'With another name'},
		{trigger: 'My nice note|With another name', expectedAlias: 'With another name'},
		{trigger: 'My nice note| name', expectedAlias: 'name'},
		{trigger: 'My nice note| name ', expectedAlias: 'name'},
		{trigger: 'My nice note|name ', expectedAlias: 'name'},
		{trigger: 'My nice note|', expectedAlias: undefined},
		{trigger: 'My nice note', expectedAlias: undefined},
	])('uses alias $expectedAlias when trigger $trigger is given', ({trigger, expectedAlias}) => {
		const suggestion = new Suggestion(trigger)
		expect(suggestion.Alias).toBe(expectedAlias)
	})
})
