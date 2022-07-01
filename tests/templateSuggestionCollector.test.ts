import {Fake} from "./Fake"
import {TemplateSuggestionCollector} from "../src/core/suggestionCollection/TemplateSuggestionCollector"
import {NewNoteSuggestion} from "../src/core/suggestions/NoteSuggestion"
import 'jest-extended'
import {TemplateSuggestion} from "../src/core/suggestions/TemplateSuggestion"

const fakeNote = new NewNoteSuggestion('my note')

describe('when only templater is enabled', function () {
	test('templates from the configured templates folder are collected', () => {
		const templaterTemplates = ['template1', 'template2', 'scripts/template4']
		const rootTemplateFolder = 'templater/templates'
		const templatePaths = templaterTemplates.map(path => `${rootTemplateFolder}/${path}`)
		const interop = Fake.Interop
		interop.getTemplaterTemplatesPath = () => rootTemplateFolder
		const expectedSuggestions = templatePaths.map(path => new TemplateSuggestion(path, fakeNote, rootTemplateFolder))
		const fileSystem = Fake.FileSystem.withDescendantsOf(rootTemplateFolder, templatePaths)

		const templateCollector = new TemplateSuggestionCollector(fileSystem, interop, Fake.Settings)

		const observedTemplates = templateCollector.getSuggestions('', fakeNote )

		expect(observedTemplates).toStrictEqual(expectedSuggestions)
	})

	test('no templates are collected if the templates folder has not been configured', () => {
		const templaterTemplates = ['template1', 'template2', 'scripts/template4']
		const rootTemplateFolder = 'templater/templates'
		const templatePaths = templaterTemplates.map(path => `${rootTemplateFolder}/${path}`)
		const interop = Fake.Interop
		interop.getTemplaterTemplatesPath = () => undefined
		const fileSystem = Fake.FileSystem.withDescendantsOf(rootTemplateFolder, templatePaths)

		const templateCollector = new TemplateSuggestionCollector(fileSystem, interop, Fake.Settings)

		const observedTemplates = templateCollector.getSuggestions('', fakeNote )

		expect(observedTemplates).toBeEmpty()
	})
})


