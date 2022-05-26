import {Fake} from "./Fake"
import {TemplateSuggestionCollector} from "../src/core/suggestionCollection/TemplateSuggestionCollector"
import {NewNoteSuggestion} from "../src/core/suggestions/NoteSuggestion"
import 'jest-extended'
import {TemplateSuggestion} from "../src/core/suggestions/TemplateSuggestion"

const fakeNote = new NewNoteSuggestion('my note')

describe('when only core templates are enabled', function () {
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
		const coreTemplates = ['template1', 'template2', 'scripts/template4']
		const rootTemplateFolder = 'tmp/templates'
		const templatePaths = coreTemplates.map(path => `${rootTemplateFolder}/${path}`)
		const interop = Fake.Interop
		interop.getCoreTemplatesPath = () => undefined
		const fileSystem = Fake.FileSystem.withDescendantsOf(rootTemplateFolder, templatePaths)

		const templateCollector = new TemplateSuggestionCollector(fileSystem, interop)

		const observedTemplates = templateCollector.getSuggestions('', fakeNote )

		expect(observedTemplates).toBeEmpty()
	})
})

describe('when only templater is enabled', function () {
	test('templates from the configured templates folder are collected', () => {
		const templaterTemplates = ['template1', 'template2', 'scripts/template4']
		const rootTemplateFolder = 'templater/templates'
		const templatePaths = templaterTemplates.map(path => `${rootTemplateFolder}/${path}`)
		const interop = Fake.Interop
		interop.getTemplaterTemplatesPath = () => rootTemplateFolder
		const expectedSuggestions = templatePaths.map(path => new TemplateSuggestion(path, fakeNote, rootTemplateFolder))
		const fileSystem = Fake.FileSystem.withDescendantsOf(rootTemplateFolder, templatePaths)

		const templateCollector = new TemplateSuggestionCollector(fileSystem, interop)

		const observedTemplates = templateCollector.getSuggestions('', fakeNote )

		expect(observedTemplates).toIncludeSameMembers(expectedSuggestions)
	})

	test('no templates are collected if the templates folder has not been configured', () => {
		const templaterTemplates = ['template1', 'template2', 'scripts/template4']
		const rootTemplateFolder = 'templater/templates'
		const templatePaths = templaterTemplates.map(path => `${rootTemplateFolder}/${path}`)
		const interop = Fake.Interop
		interop.getTemplaterTemplatesPath = () => undefined
		const fileSystem = Fake.FileSystem.withDescendantsOf(rootTemplateFolder, templatePaths)

		const templateCollector = new TemplateSuggestionCollector(fileSystem, interop)

		const observedTemplates = templateCollector.getSuggestions('', fakeNote )

		expect(observedTemplates).toBeEmpty()
	})
})

describe('when both core templates and templater are enabled prioritize templates from templater', function () {
	const templaterTemplates = ['template1', 'scripts/aa template']
	const coreTemplates = ['templater/template1', 'templater/scripts/aa template', 'a core template']
	const rootTemplaterFolder = 'templates/templater'
	const rootCoreFolder = 'templates'
	const templaterPaths = templaterTemplates.map(path => `${rootTemplaterFolder}/${path}`)
	const corePaths = coreTemplates.map(path => `${rootCoreFolder}/${path}`)
	const interop = Fake.Interop
	interop.getTemplaterTemplatesPath = () => rootTemplaterFolder
	interop.getCoreTemplatesPath = () => rootCoreFolder
	const fileSystem = Fake.FileSystem
		.withDescendantsOf(rootTemplaterFolder, templaterPaths)
		.withDescendantsOf(rootCoreFolder, corePaths)

	const expectedSuggestions = [
		new TemplateSuggestion('templates/templater/scripts/aa template', fakeNote, rootTemplaterFolder),
		new TemplateSuggestion('templates/a core template', fakeNote, rootCoreFolder),
		new TemplateSuggestion('templates/templater/template1', fakeNote, rootTemplaterFolder),
	]

	const templateCollector = new TemplateSuggestionCollector(fileSystem, interop)

	const observedTemplates = templateCollector.getSuggestions('', fakeNote )

	expect(observedTemplates).toStrictEqual(expectedSuggestions)
})


