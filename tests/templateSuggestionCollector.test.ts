import {Fake} from "./Fake"
import {TemplateSuggestionCollector} from "../src/core/suggestionCollection/TemplateSuggestionCollector"
import {NewNoteSuggestion} from "../src/core/suggestions/NoteSuggestion"
import 'jest-extended'
import {TemplateSuggestion} from "../src/core/suggestions/TemplateSuggestion"

const fakeNote = new NewNoteSuggestion('my note')

describe('when core templates are enabled', function () {
	test('templates from the configured templates folder are collected', () => {
		const coreTemplates = ['template1', 'template2', 'scripts/template4']
		const rootTemplateFolder = 'tmp/templates'
		const templatePaths = coreTemplates.map(path => `${rootTemplateFolder}/${path}`)
		const interop = Fake.Interop
		interop.getCoreTemplatesPath = () => rootTemplateFolder
		const expectedSuggestions = templatePaths.map(path => new TemplateSuggestion(path, fakeNote, rootTemplateFolder))
		const fileSystem = Fake.FileSystem.withDescendantsOf(rootTemplateFolder, templatePaths)

		const templateCollector = new TemplateSuggestionCollector(fileSystem, interop)

		const observedTemplates = templateCollector.getSuggestions('', fakeNote )

		expect(observedTemplates).toIncludeSameMembers(expectedSuggestions)
	})

	test('no templates are collected if the templates folder has not been configured', () => {

	})
})


