import {App, ButtonComponent, PluginSettingTab, SearchComponent, Setting, TextComponent} from "obsidian"
import NoteAutoCreator from "../main"
import {ObsidianFolderPath} from "../core/paths/ObsidianFolderPath"
import {FolderSuggest} from "./FolderSuggester"
import {FolderSuggestionMode} from "./NoteAutoCreatorSettings"
import {IConfigurationStore, IFileSystem} from "../interop/ObsidianInterfaces"
import {FileSuggester} from "./FileSuggester"

export class SettingTab extends PluginSettingTab {
	plugin: NoteAutoCreator
	private readonly configStore: IConfigurationStore
	private readonly fileSystem: IFileSystem

	// Problematic symbols are based on this table from the markdown guide:
	// https://www.markdownguide.org/basic-syntax/#characters-you-can-escape
	private readonly problematicSymbols = ["\\", "`", "*", "_", "{", "}", "[", "]", "<", ">", "(", ")", "#", "+", "-", ".", "!", "|"]

	constructor(app: App, plugin: NoteAutoCreator, configStore: IConfigurationStore, fileSystem: IFileSystem) {
		super(app, plugin)
		this.plugin = plugin
		this.configStore = configStore
		this.fileSystem = fileSystem
	}

	display(): void {
		const {containerEl} = this
		containerEl.empty()

		this.addSuggestionTriggerSetting(containerEl)
		this.addSuggestNonExistingNotesSetting(containerEl)
		this.addRelativePathsSetting(containerEl)
		this.addFolderSearchTriggerSetting(containerEl)

		// @ts-ignore
		// No need to show the setting if templater does not exist
		if (this.configStore.templaterIsEnabled){
			this.addTemplaterTriggerSetting(containerEl)
			this.addDefaultTemplaterTemplateSetting(containerEl)
		}

		// @ts-ignore
		// No need to show the setting if QuickAdd does not exist
		if (this.configStore.quickAddIsEnabled){
			this.addQuickAddTriggerSetting(containerEl)
			this.addDefaultQuickAddTemplateSetting(containerEl)
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
				let searchComponent: SearchComponent
				new Setting(containerEl)
					.addSearch(cb => {
						searchComponent = cb
						cb.setPlaceholder('Folder name or path')
							.setValue(folderPath.VaultPath)
							.onChange(async newValue => {
								folderPaths[index] = new ObsidianFolderPath(newValue)
								await this.plugin.saveSettings()
							})
					})
					.addExtraButton(cb => cb
						.setIcon('search')
						.setTooltip('Search for specific folder')
						.onClick(() => {
							new FolderSuggest(this.app, searchComponent.inputEl)
							searchComponent.inputEl.select()
						})
					)
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

	private addRelativePathsSetting(containerEl: HTMLElement){
		new Setting(containerEl)
			.setName('Enable relative paths')
			.setDesc("Set this to true if you want an easy way to link to notes in the same folder as the active note or in the parent folder. Use './' to link to a note in the same folder as the active note. Use '../' to link to a note in the parent folder of the active note's folder.")
			.addToggle(component => component
				.setValue(this.plugin.settings.enableRelativePaths)
				.onChange(async value => {
						this.plugin.settings.enableRelativePaths = value
						await this.plugin.saveSettings()
					}
				)
			)
	}

	private addTemplaterTriggerSetting(containerEl: HTMLElement) {
		new Setting(containerEl)
			.setName('Trigger for executing Templater templates')
			.setDesc('The text string that will trigger execution of a Tempalter template. Leave empty if you don\'t need the ability to trigger Templater templates')
			.addText(component => component
				.setValue(this.plugin.settings.templateTriggerSymbol)
				.onChange(async (value) => {
					this.plugin.settings.templateTriggerSymbol = value
					await this.plugin.saveSettings()
				})
			)
	}

	private addDefaultTemplaterTemplateSetting(containerEl: HTMLElement){
		let searchComponent: SearchComponent
		new Setting(containerEl)
			.setName('Default Templater template')
			.setDesc('This template will be the first in the list of templates to select from when triggering Templater template execution')
			.addSearch(cb => {
				searchComponent = cb
				new FileSuggester(this.app, searchComponent.inputEl, this.configStore.getTemplaterTemplatesPath(), this.fileSystem)
				cb.setPlaceholder('Default Templater template')
					.setValue(this.plugin.settings.defaultTemplaterTemplate)
					.onChange(async newValue => {
						this.plugin.settings.defaultTemplaterTemplate = newValue
						await this.plugin.saveSettings()
					})
			})
	}

	private addDefaultQuickAddTemplateSetting(containerEl: HTMLElement){
		let searchComponent: SearchComponent
		new Setting(containerEl)
			.setName('Default QuickAdd template')
			.setDesc('This template will be the first in the list of templates to select from when triggering QuickAdd template execution')
			.addSearch(cb => {
				searchComponent = cb
				new FileSuggester(this.app, searchComponent.inputEl, this.configStore.getQuickAddTemplatesPath(), this.fileSystem)
				cb.setPlaceholder('Default QuickAdd template')
					.setValue(this.plugin.settings.defaultQuickAddTemplate)
					.onChange(async newValue => {
						this.plugin.settings.defaultQuickAddTemplate = newValue
						await this.plugin.saveSettings()
					})
			})
	}

	private addQuickAddTriggerSetting(containerEl: HTMLElement) {
		new Setting(containerEl)
			.setName('Trigger for executing QuickAdd templates')
			.setDesc("The text string that will trigger execution of a QuickAdd template. Leave empty if you don't need the ability to trigger QuickAdd templates")
			.addText(component => component
				.setValue(this.plugin.settings.quickAddTriggerSymbol)
				.onChange(async (value) => {
					this.plugin.settings.quickAddTriggerSymbol = value
					await this.plugin.saveSettings()
				})
			)
	}

	private addFolderSearchTriggerSetting(containerEl: HTMLElement){
		const description = document.createDocumentFragment()
		description.append(
			'Set this to true if you want to include folders in the suggestions shown.',
			description.createEl('br'),
			'You cannot create a link to a folder, but it makes it easier to create a new note or link to an existing note that is deep in your folder structure.',
			description.createEl('br'),
			'Extra options are available to control when the folder suggestions are shown.'
		)

		new Setting(containerEl)
			.setName('Include folders in suggestions')
			.setDesc(description)
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.includeFoldersInSuggestions)
				.onChange(async(value) => {
					this.plugin.settings.includeFoldersInSuggestions = value
					await this.plugin.saveSettings()
					this.display() // Force refresh
				})
			)

		if (this.plugin.settings.includeFoldersInSuggestions){
			const folderSuggestionSettings = this.plugin.settings.folderSuggestionSettings ?? {folderSuggestionMode: FolderSuggestionMode.Always, folderSuggestionTrigger: '/'}
			new Setting(containerEl)
				.setName('When should folder suggestions be shown')
				.addDropdown(dropdown => {
					dropdown
						.addOption('always', 'Always')
						.addOption('on-trigger', 'Only on trigger')
						.setValue(folderSuggestionSettings.folderSuggestionMode)
						.onChange(async(value) => {
							folderSuggestionSettings.folderSuggestionMode = value as FolderSuggestionMode
							this.plugin.settings.folderSuggestionSettings = folderSuggestionSettings
							await this.plugin.saveSettings()
							this.display() // force refresh
						})
					}
				)

			if (folderSuggestionSettings.folderSuggestionMode === FolderSuggestionMode.OnTrigger){
				new Setting(containerEl)
					.setName('Trigger for showing only folders')
					.setDesc(`The text string that will trigger folder suggestions to be shown. Note that it will only trigger if this is the first symbol you write after writing '${this.plugin.settings.triggerSymbol}'`)
					.addText(component => component
						.setValue(folderSuggestionSettings.folderSuggestionTrigger)
						.onChange(async (value) => {
							folderSuggestionSettings.folderSuggestionTrigger = value
							this.plugin.settings.folderSuggestionSettings = folderSuggestionSettings
							await this.plugin.saveSettings()
						})
					)
			}
		}
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
