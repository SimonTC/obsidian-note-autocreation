import {TemplateEngine} from "./TemplateEngine"

export interface ITemplateConfig {
	getTemplateFolderPath(): string

	getDefaultTemplate(): string

	triggerSymbol: string

	templateEngine: TemplateEngine
}
