import {ITemplateConfig} from "./ITemplateConfig"
import {NoteAutoCreatorSettings} from "../../settings/NoteAutoCreatorSettings"
import {IConfigurationStore} from "../../interop/ObsidianInterfaces"
import {TemplateEngine} from "./TemplateEngine"

export class TemplaterTemplateConfig implements ITemplateConfig {

	private readonly settings: NoteAutoCreatorSettings
	private readonly configStore: IConfigurationStore
	readonly templateEngine = TemplateEngine.Templater

	get triggerSymbol() {
		return this.settings.templateTriggerSymbol
	}

	constructor(configStore: IConfigurationStore, settings: NoteAutoCreatorSettings) {
		this.settings = settings
		this.configStore = configStore
	}

	getDefaultTemplate(): string {
		return this.settings.defaultTemplaterTemplate
	}

	getTemplateFolderPath(): string {
		return this.configStore.getTemplaterTemplatesPath()
	}
}
