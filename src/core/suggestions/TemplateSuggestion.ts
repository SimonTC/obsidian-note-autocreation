import {FileSuggestion} from "./FileSuggestion"
import {NoteSuggestion} from "./NoteSuggestion"

export class TemplateSuggestion extends FileSuggestion{
	readonly noteSuggestion: NoteSuggestion
	readonly triggerSymbol: string = '$'
	private readonly rootTemplateFolder
	private readonly templateIsInTemplateFolder: boolean
	private readonly pathFromTemplateRoot: string

	constructor(templatePath: string, noteSuggestion: NoteSuggestion, rootTemplateFolder: string) {
		super(templatePath)
		this.rootTemplateFolder = rootTemplateFolder
		this.templateIsInTemplateFolder = this.VaultPath.toLowerCase().includes(rootTemplateFolder.toLowerCase())
		this.pathFromTemplateRoot = this.templateIsInTemplateFolder
			? this.VaultPathWithoutExtension.slice(this.rootTemplateFolder.length)
			: this.VaultPathWithoutExtension
		this.noteSuggestion = noteSuggestion
	}

	render(el: HTMLElement): void {
		el.createDiv({
			cls: "suggestion-content",
			text: this.pathFromTemplateRoot
		})
		el.createDiv({
			cls: "suggestion-note",
			text: `Apply template to "${this.noteSuggestion.VaultPath}"`
		})
	}

	get textToInsertOnLineUpdate(): string {
		return `${this.noteSuggestion.textToInsertOnLineUpdate}${this.triggerSymbol}${this.pathFromTemplateRoot}`
	}
}
