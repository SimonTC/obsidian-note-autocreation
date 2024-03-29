import 'jest-extended'
import {Fake} from "./Fake"
import {ObsidianFolderPath} from "../src/core/paths/ObsidianFolderPath"
import {ObsidianFilePath} from "../src/core/paths/ObsidianFilePath"
import {ExistingNoteSuggestion} from "../src/core/suggestions/NoteSuggestion"
import {Query} from "../src/core/queries/Query"

describe('topFolderCheck', function () {
	test('ignores word cases', () => {
		const relativeTopFolders = [
			new ObsidianFolderPath('FOLDER')
		]
		const settings = Fake.Settings
		settings.relativeTopFolders = relativeTopFolders

		const query = 'note'
		const queryPath = new ObsidianFilePath(query)
		const currentFile = Fake.File('folder1/folder2/my markdown file')


		const context = Fake.EditorSuggestionContext(query).withFile(currentFile)

		const matcher = Query.topFolderCheck(queryPath, context, settings)

		const result = matcher(new ExistingNoteSuggestion('folder1/folder2/some note'))
		expect(result).toBe(true)
	})
})
