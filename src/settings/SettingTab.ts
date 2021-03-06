import {App, PluginSettingTab, Setting, TextComponent} from "obsidian"
import NoteAutoCreator from "../main"

export class SettingTab extends PluginSettingTab {
	plugin: NoteAutoCreator

	// Problematic symbols are based on this table from the markdown guide:
	// https://www.markdownguide.org/basic-syntax/#characters-you-can-escape
	private readonly problematicSymbols = ["\\", "`", "*", "_", "{", "}", "[", "]", "<", ">", "(", ")", "#", "+", "-", ".", "!", "|"]

	constructor(app: App, plugin: NoteAutoCreator) {
		super(app, plugin)
		this.plugin = plugin
	}

	display(): void {
		const {containerEl} = this
		containerEl.empty()

		this.addSuggestionTriggerSetting(containerEl)
		this.addSuggestNonExistingNotesSetting(containerEl)

		// @ts-ignore
		// No need to show the setting if templater does not exist
		if (this.app.plugins.plugins["templater-obsidian"]){
			this.addTemplateTriggerSetting(containerEl)
		}
	}

	private addSuggestionTriggerSetting(containerEl: HTMLElement) {
		const trigger = new Setting(containerEl)
			.setName('Trigger for link insertion')
			.setDesc('The text string that will trigger link selection.')
			.setTooltip(
				'The string can contain multiple symbols such as @@ ' +
				'Avoid using characters / strings you often use while writing or that might be used by Obsidian or by other plugins to trigger actions. ' +
				'Some examples of strings to avoid: "[", "|", "#"')
		trigger.addText(component => component
			.setValue(this.plugin.settings.triggerSymbol)
			.onChange(async (value) => {
				this.removeValidationWarning(component, trigger)
				this.warnIfTriggerIsProblematic(value, trigger, component)
				this.plugin.settings.triggerSymbol = value
				await this.plugin.saveSettings()
			}))
	}

	private addSuggestNonExistingNotesSetting(containerEl: HTMLElement){
		new Setting(containerEl)
			.setName('Suggest existing links to notes that do not exist')
			.setDesc('Set this to false if you do not want to get suggestions for existing links to notes that do not exist.')
			.addToggle(component => component
				.setValue(this.plugin.settings.suggestLinksToNonExistingNotes)
				.onChange(async value => {
					this.plugin.settings.suggestLinksToNonExistingNotes = value
					await this.plugin.saveSettings()
				}
			)
		)
	}

	private addTemplateTriggerSetting(containerEl: HTMLElement) {
		new Setting(containerEl)
			.setName('Trigger for template execution')
			.setDesc('The text string that will trigger template execution')
			.addText(component => component
				.setValue(this.plugin.settings.templateTriggerSymbol)
				.onChange(async (value) => {
					this.plugin.settings.templateTriggerSymbol = value
					await this.plugin.saveSettings()
				})
			)
	}

	private warnIfTriggerIsProblematic(value: string, trigger: Setting, component: TextComponent) {
		const triggerStartsWithProblematicCharacter = this.problematicSymbols.some(problem => value.startsWith(problem))
		const triggerIsEmptyOrOnlyWhitespace = value.trim().length === 0
		const triggerIsProblematic = triggerStartsWithProblematicCharacter || triggerIsEmptyOrOnlyWhitespace
		if (triggerIsProblematic) {
			trigger.controlEl.addClass('setting-warning')
			component.inputEl.setCustomValidity(`Using '${value}' as the trigger for inserting links might not work as intended`)
			component.inputEl.reportValidity()
		}
	}

	private removeValidationWarning(component: TextComponent, trigger: Setting) {
		component.inputEl.setCustomValidity('')
		component.inputEl.reportValidity()
		trigger.controlEl.removeClass('setting-warning')
	}
}
