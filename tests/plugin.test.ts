import NoteAutoCreator from "../src/main";

class Suggestion{

	readonly VaultPath: string;

	constructor(expectedPath: string) {
		this.VaultPath = expectedPath;
	}


}

class SuggestionCollector{
	private metadata: IMetadataCollection;

	constructor(metadata: IMetadataCollection) {
		this.metadata = metadata;
	}

	getSuggestions(): Suggestion[] {
		return []
	}
}

/**
 * Interface for accessing metadata from Obsidian
 */
interface IMetadataCollection{
	unresolvedLinks:  Record<string, Record<string, number>>
}

describe('the list of suggestions', function () {
	test('is empty if there are no files in the vault', () => {
		const metadata = <IMetadataCollection>{unresolvedLinks: {} };
		const collector = new SuggestionCollector(metadata);

		const suggestions = collector.getSuggestions();

		expect(suggestions).toEqual<Suggestion[]>([]);
	})

	test('contains all files in the vault', () => {

	})

	test('contains links that do not have any files created for them', () => {

	})

	test('filters out suggestions that do not contain the link text', () => {

	})

	test('is sorted in alphabetical order by link name', () => {

	})

	test('does not use the trigger symbol for filtering', () => {

	})

	test('uses the trigger symbol for filtering if there is more than one instance of it', () => {

	})
});

describe('a single suggestion', function () {
	test('has the folder of the link as a description', () => {

	})

	test('uses only the name of the link object as name', () => {

	})

	test('does not contain the extension in the name', () => {

	})

	test('stores the full vault path', () => {
		const expectedPath = 'reading/books/short-stories/how I Won.md'
		const suggestion = new Suggestion(expectedPath)

		expect(suggestion.VaultPath).toEqual(expectedPath);
	})
});

describe('when the suggestion for a link to a non-existing file is accepted', function () {
	test('the file is created', () => {

	})

	test('missing folders in the link path are created if they do not exist', () => {

	})

	test('only the suggestion name is shown in the document', () => {

	})
});

test('no file is created if the suggestion name is empty', () => {

})




