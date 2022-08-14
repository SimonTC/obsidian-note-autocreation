import {App, ButtonComponent, PluginSettingTab, Setting, TextComponent} from "obsidian"
import NoteAutoCreator from "../main"
import {ObsidianFolderPath} from "../core/paths/ObsidianFolderPath"
import {FolderSuggest} from "./FolderSuggester"

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

		this.addRelativeTopFolderSetting(containerEl)
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

	private moveFolderPath (pathCollection: ObsidianFolderPath[], fromIndex: number, toIndex: number) {
		if (toIndex < 0 || toIndex > pathCollection.length -1 ){
			return
		}

		const thisPath = pathCollection[fromIndex]
		const otherPath = pathCollection[toIndex]
		pathCollection[toIndex] = thisPath
		pathCollection[fromIndex] = otherPath
	}

	private addRelativeTopFolderSetting(containerEl: HTMLElement){
		containerEl.createEl("h2", { text: "Relative top folders" })
		const description = document.createDocumentFragment()
		description.append(
			'Add folder names or paths to folders here if you want to filter suggestions when inserting new links. ',
			'The filtering is activated when inserting a link in a note that has any of the specified folders in its folder tree. ',
			'Only suggestions for notes that also have the same folder in their folder tree are shown.',
			description.createEl('br'),
			description.createEl('br'),
			description.createEl('strong', { text: 'Example ' }),
			description.createEl('br'),
			'If you are inserting a link in "folder1/folder2/note.md" and you have configured "folder1" as a relative top folder, then you will only get suggestions for other notes descending from folder 1.',
			description.createEl('br'),
			description.createEl('br'),
			'The folder names are checked in prioritized order. ',
			'If both "folder1/folder2" and "folder1" are defined as relative top folders, ',
			'then "folder1/folder2" is used as the relative top folder if the path to the note is "folder1/folder2/note". ',
			'If the path to the note is "folder1/my note", then "folder1" is used as the top folder.'
		)
		new Setting(containerEl).setDesc(description)

		const folderPaths = this.plugin.settings.relativeTopFolders
		new Setting(containerEl)
			.setName("Add New")
			.setDesc("Add new relative top folder")
			.addButton((button: ButtonComponent) => {
				button
					.setButtonText("+")
					.setCta()
					.onClick(async () => {
						folderPaths.push(new ObsidianFolderPath(''))
						await this.plugin.saveSettings()
						this.display()
					})
			})

		folderPaths.forEach(
			(folderPath, index) => {
				new Setting(containerEl)
					.addSearch(cb => {
						new FolderSuggest(this.app, cb.inputEl)
						cb.setPlaceholder('Folder name or path')
							.setValue(folderPath.VaultPath)
							.onChange(async newValue => {
								folderPaths[index] = new ObsidianFolderPath(newValue)
								await this.plugin.saveSettings()
							})
					})
					.addExtraButton(cb => cb
						.setIcon('cross')
						.setTooltip('Delete')
						.onClick(async() =>{
							folderPaths.splice(index, 1)
							await this.plugin.saveSettings()
							this.display()
						})
					)
					.addExtraButton(cb => cb
						.setIcon('down-chevron-glyph')
						.setTooltip('Decrease priority')
						.onClick(async () => {
							this.moveFolderPath(folderPaths, index, index + 1)
							await this.plugin.saveSettings()
							this.display()
						})
					)
					.addExtraButton(cb => cb
						.setIcon('up-chevron-glyph')
						.setTooltip('Increase priority')
						.onClick(async () => {
							this.moveFolderPath(folderPaths, index, index -1)
							await this.plugin.saveSettings()
							this.display()
						})
					)
			}
		)
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
