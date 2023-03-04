import {Fake, FakeTemplateConfig} from "./Fake"
import {TemplateSuggestionCollector} from "../src/core/suggestionCollection/TemplateSuggestionCollector"
import {NewNoteSuggestion} from "../src/core/suggestions/NoteSuggestion"
import 'jest-extended'
import {TemplateSuggestion} from "../src/core/suggestions/TemplateSuggestion"

const fakeNote = new NewNoteSuggestion('my note')

describe('when only templater is enabled', function () {
	test('templates from the configured templates folder are collected', () => {
		const rootTemplateFolder = 'templater/templates'
		const templateConfig = new FakeTemplateConfig("", rootTemplateFolder)
		const templaterTemplates = ['template1', 'template2', 'scripts/template4']
		const templatePaths = templaterTemplates.map(path => `${rootTemplateFolder}/${path}`)
		const expectedSuggestions = templatePaths.map(path => new TemplateSuggestion(path, fakeNote, rootTemplateFolder, "$"))
		const fileSystem = Fake.FileSystem.withDescendantsOf(rootTemplateFolder, templatePaths)

		const templateCollector = new TemplateSuggestionCollector(fileSystem, Fake.Interop, Fake.Settings, templateConfig)

		const observedTemplates = templateCollector.getSuggestions('', fakeNote )

		expect(observedTemplates).toStrictEqual(expectedSuggestions)
	})

	test('default template is not returned as first result when query is not empty', () => {
		const defaultTemplate = 'scripts/template4'
		const templaterTemplates = ['template1', 'template2', defaultTemplate]
		const rootTemplateFolder = 'templater/templates'
		const templatePaths = templaterTemplates.map(path => `${rootTemplateFolder}/${path}`)
		const interop = Fake.Interop
		interop.getTemplaterTemplatesPath = () => rootTemplateFolder
		const expectedSuggestions = [
			new TemplateSuggestion(templatePaths[0], fakeNote, rootTemplateFolder, "$"),
			new TemplateSuggestion(templatePaths[1], fakeNote, rootTemplateFolder, "$"),
			new TemplateSuggestion(templatePaths[2], fakeNote, rootTemplateFolder, "$"),
		]
		const fileSystem = Fake.FileSystem.withDescendantsOf(rootTemplateFolder, templatePaths)

		const templateConfig = new FakeTemplateConfig(templatePaths[2], rootTemplateFolder)
		const templateCollector = new TemplateSuggestionCollector(fileSystem, interop, Fake.Settings, templateConfig)

		const observedTemplates = templateCollector.getSuggestions('t', fakeNote )

		expect(observedTemplates).toStrictEqual(expectedSuggestions)
	})

	test('default template is returned as first result when query is empty', () => {
		const defaultTemplate = 'scripts/template4'
		const templaterTemplates = ['template1', 'template2', defaultTemplate]
		const rootTemplateFolder = 'templater/templates'
		const templatePaths = templaterTemplates.map(path => `${rootTemplateFolder}/${path}`)
		const interop = Fake.Interop
		interop.getTemplaterTemplatesPath = () => rootTemplateFolder
		const expectedSuggestions = [
			new TemplateSuggestion(templatePaths[2], fakeNote, rootTemplateFolder, "$"),
			new TemplateSuggestion(templatePaths[0], fakeNote, rootTemplateFolder, "$"),
			new TemplateSuggestion(templatePaths[1], fakeNote, rootTemplateFolder, "$"),
		]
		const fileSystem = Fake.FileSystem.withDescendantsOf(rootTemplateFolder, templatePaths)
		const templateConfig = new FakeTemplateConfig(templatePaths[2], rootTemplateFolder)

		const templateCollector = new TemplateSuggestionCollector(fileSystem, interop, Fake.Settings, templateConfig)

		const observedTemplates = templateCollector.getSuggestions('', fakeNote )

		expect(observedTemplates).toStrictEqual(expectedSuggestions)
	})

	test('templates are filtered', () => {
		const templaterTemplates = ['my first template', 'template2', 'scripts/template4']
		const rootTemplateFolder = 'templater/templates'
		const templatePaths = templaterTemplates.map(path => `${rootTemplateFolder}/${path}`)
		const expectedSuggestions = [new TemplateSuggestion(`${rootTemplateFolder}/my first template`, fakeNote, rootTemplateFolder, "$")]
		const fileSystem = Fake.FileSystem.withDescendantsOf(rootTemplateFolder, templatePaths)
		const templateConfig = new FakeTemplateConfig("", rootTemplateFolder)

		const templateCollector = new TemplateSuggestionCollector(fileSystem, Fake.Interop, Fake.Settings, templateConfig)

		const observedTemplates = templateCollector.getSuggestions('fi', fakeNote )

		expect(observedTemplates).toStrictEqual(expectedSuggestions)
	})

	test('no templates are collected if the templates folder has not been configured', () => {
		const templaterTemplates = ['template1', 'template2', 'scripts/template4']
		const rootTemplateFolder = 'templater/templates'
		const templatePaths = templaterTemplates.map(path => `${rootTemplateFolder}/${path}`)
		const fileSystem = Fake.FileSystem.withDescendantsOf(rootTemplateFolder, templatePaths)
		const templateConfig = new FakeTemplateConfig("", undefined)

		const templateCollector = new TemplateSuggestionCollector(fileSystem, Fake.Interop, Fake.Settings, templateConfig)

		const observedTemplates = templateCollector.getSuggestions('', fakeNote )

		expect(observedTemplates).toBeEmpty()
	})
})


