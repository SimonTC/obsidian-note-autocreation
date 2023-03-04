import {FileSuggestion} from "./FileSuggestion"
import {NoteSuggestion} from "./NoteSuggestion"
import {SuggestionRenderer} from "./SuggestionRenderer"

export class TemplateSuggestion extends FileSuggestion{
	readonly noteSuggestion: NoteSuggestion
	private readonly triggerSymbol: string
	private readonly rootTemplateFolder
	private readonly templateIsInTemplateFolder: boolean
	private readonly pathFromTemplateRoot: string

	constructor(templatePath: string, noteSuggestion: NoteSuggestion, rootTemplateFolder: string, triggerSymbol: string) {
		super(templatePath)
		this.rootTemplateFolder = rootTemplateFolder ?? ""
		this.templateIsInTemplateFolder = this.VaultPath.toLowerCase().includes(this.rootTemplateFolder.toLowerCase())
		this.pathFromTemplateRoot = this.templateIsInTemplateFolder
			? this.VaultPathWithoutExtension.slice(this.rootTemplateFolder.length)
			: this.VaultPathWithoutExtension
		this.noteSuggestion = noteSuggestion
		this.triggerSymbol = triggerSymbol
	}

	render(el: HTMLElement): void {
		SuggestionRenderer.RenderSuggestion(el, {
			content: this.pathFromTemplateRoot,
			note: `Apply template to "${this.noteSuggestion.VaultPath}"`,
		})
	}

	get textToInsertOnLineUpdate(): string {
		return `${this.noteSuggestion.textToInsertOnLineUpdate}${this.triggerSymbol}${this.pathFromTemplateRoot}`
	}
}
