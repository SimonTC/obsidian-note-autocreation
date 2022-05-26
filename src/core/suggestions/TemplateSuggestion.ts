import {Suggestion} from "./Suggestion"
import {NoteSuggestion} from "./NoteSuggestion"

export class TemplateSuggestion extends Suggestion{
	readonly noteSuggestion: NoteSuggestion
	readonly triggerSymbol: string = '$'
	private readonly rootTemplateFolder
	private readonly templateIsInTemplateFolder: boolean

	constructor(templatePath: string, noteSuggestion: NoteSuggestion, rootTemplateFolder: string) {
		super(templatePath)
		this.rootTemplateFolder = rootTemplateFolder
		this.templateIsInTemplateFolder = this.VaultPath.toLowerCase().includes(rootTemplateFolder.toLowerCase())
		this.noteSuggestion = noteSuggestion
	}

	render(el: HTMLElement): void {
		const suggestionText = this.templateIsInTemplateFolder
			? this.VaultPathWithoutExtension.slice(this.rootTemplateFolder.length)
			: this.VaultPathWithoutExtension
		el.createDiv({
			cls: "suggestion-content",
			text: suggestionText
		})
		el.createDiv({
			cls: "suggestion-note",
			text: `Apply template to "${this.noteSuggestion.VaultPath}"`
		})
	}

	get textToInsertOnLineUpdate(): string {
		return `${this.noteSuggestion.textToInsertOnLineUpdate}${this.triggerSymbol}${this.VaultPathWithoutExtension}`
	}
}
