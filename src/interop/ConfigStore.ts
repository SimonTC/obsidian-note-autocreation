import {IConfigurationStore} from "./ObsidianInterfaces"
import {App} from "obsidian"

export class ConfigStore implements IConfigurationStore {

	private readonly app: App

	constructor(app: App) {
		this.app = app
	}

	getCoreTemplatesPath(): string | undefined {
		// @ts-ignore
		const internalTemplatePlugin = this.app.internalPlugins.plugins.templates
		if (internalTemplatePlugin) {
			const templateFolderPath = internalTemplatePlugin.instance.options.folder
			if (templateFolderPath)
				return templateFolderPath
		}
	}

	getTemplaterTemplatesPath(): string | undefined {
		// @ts-ignore
		const templater = this.app.plugins.plugins["templater-obsidian"]
		if (templater) {
			const templateFolderPath = templater.settings["templates_folder"]
			if (templateFolderPath)
				return templateFolderPath
		}
	}

	getQuickAddTemplatesPath(): string | undefined {
		// @ts-ignore
		const quickAdd = this.app.plugins.plugins.quickadd
		if (quickAdd) {
			const templateFolderPath = quickAdd.settings["templateFolderPath"]
			if (templateFolderPath)
				return templateFolderPath
		}
	}

	getValueFor(configKey: string): unknown {
		// @ts-ignore
		return this.app.vault.getConfig(configKey)
	}

	get templaterIsEnabled(): boolean {
		// @ts-ignore
		return this.app.plugins.plugins["templater-obsidian"]
	}

	get quickAddIsEnabled(): boolean {
		return this.app.plugins.plugins.quickadd
	}

}
