import {ITemplateConfig} from "./ITemplateConfig"
import {NoteAutoCreatorSettings} from "../../settings/NoteAutoCreatorSettings"
import {IConfigurationStore} from "../../interop/ObsidianInterfaces"
import {TemplateEngine} from "./TemplateEngine"

export class QuickAddTemplateConfig implements ITemplateConfig {

	private readonly settings: NoteAutoCreatorSettings
	private readonly configStore: IConfigurationStore
	readonly templateEngine = TemplateEngine.QuickAdd

	get triggerSymbol() {
		return this.settings.quickAddTriggerSymbol
	}

	constructor(configStore: IConfigurationStore, settings: NoteAutoCreatorSettings) {
		this.settings = settings
		this.configStore = configStore
	}

	getDefaultTemplate(): string {
		return this.settings.defaultQuickAddTemplate
	}

	getTemplateFolderPath(): string {
		return this.configStore.getQuickAddTemplatesPath()
	}
}
