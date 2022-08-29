import {IObsidianInterop, ObsidianLinkSuggestion} from "./ObsidianInterfaces"
import {App, HeadingCache, TAbstractFile, TFile, TFolder, Vault} from "obsidian"
import {FolderCreationCommand, LinkCreationCommand, NoteCreationCommand} from "../core/LinkCreationPreparer"
import {ObsidianFilePath} from "../core/paths/ObsidianFilePath"
import {ObsidianFolderPath} from "../core/paths/ObsidianFolderPath"

export class ObsidianInterop implements IObsidianInterop {
	private readonly app: App

	constructor(app: App) {
		this.app = app
	}

	async getFileContentOf(filePath: string): Promise<string> {
		const file: TAbstractFile = this.app.vault.getAbstractFileByPath(filePath)
		if (!(file instanceof TFile)) return

		return await this.app.vault.cachedRead(file)
    }

	generateMarkdownLink(file: TFile, sourcePath: string, subpath?: string, alias?: string): string {
        return this.app.fileManager.generateMarkdownLink(file, sourcePath, subpath, alias)
    }

	getUnresolvedLinks(): Record<string, Record<string, number>> {
		return this.app.metadataCache.unresolvedLinks
	}

	folderExists(folderPath: ObsidianFolderPath): boolean {
		const foundItem = this.app.vault.getAbstractFileByPath(folderPath.VaultPath)
		return foundItem && foundItem instanceof TFolder
	}

	noteExists(notePath: string): boolean {
		const foundItem = app.metadataCache.getFirstLinkpathDest(notePath, app.workspace.getActiveFile().path)
		return foundItem && foundItem instanceof TFile
	}

	getAllFileDescendantsOf(folderPath: string): TFile[]{
		const abstractFile = this.app.vault.getAbstractFileByPath(folderPath)
		if (!(abstractFile instanceof TFolder)){
			console.debug(`NAC: "${folderPath}" is not a valid path to a folder`)
			return []
		}

		const files: TFile[] = []
		Vault.recurseChildren(abstractFile as TFolder, file => {
			if (file instanceof TFile){
				files.push(file)
			}
		})
		return files
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

	async getOrCreateFileAndFoldersInPath(creationCommand: LinkCreationCommand, currentFile: TFile): Promise<TFile>{
		if (creationCommand.FolderCreationCommand){
			await this.createFolderIfNeeded(creationCommand.FolderCreationCommand)
		}

		if (creationCommand.NoteCreationCommand){
			return await this.tryCreateFile(creationCommand.NoteCreationCommand)
		} else {
			return this.app.metadataCache.getFirstLinkpathDest(creationCommand.FullPath, currentFile.path)
		}
	}

	getFile(filePath: ObsidianFilePath, currentFile: TFile): TFile | null{
		return this.app.metadataCache.getFirstLinkpathDest(filePath.VaultPath, currentFile.path)
	}

	private async createFolderIfNeeded(creationCommand: FolderCreationCommand){
		try{
			await this.app.vault.createFolder(creationCommand.PathToNewFolder.VaultPath)
		} catch (e) {
			// Folder apparently already exists.
			// This might happen if a folder of the same name but with different casing exist
			console.debug('NAC: Failed folder creation. Folder probably already exist.')
		}
	}

	private async tryCreateFile(creationCommand: NoteCreationCommand): Promise<TFile> {
		console.debug(`NAC: Note does not exist. Will be created. Path: ${creationCommand.PathToNewFile}`)

		try{
			return await this.app.vault.create(creationCommand.PathToNewFile, creationCommand.NoteContent)
		} catch (e) {
			// File apparently already exists.
			// This might happen if a file of the same name but with different casing exist
			console.debug('NAC: Failed file creation. File probably already exist.')
		}

		return undefined
	}

	getValueFor(configKey: string): any {
		// @ts-ignore
		return this.app.vault.getConfig(configKey)
	}

	async runTemplaterOn(file: TFile){
		// @ts-ignore
		const templater = this.app.plugins.plugins["templater-obsidian"]

		if (templater) {
			await templater.templater.overwrite_file_commands(file)
		}
	}

	get templaterIsEnabled(): boolean {
		// @ts-ignore
		return this.app.plugins.plugins["templater-obsidian"]
	}

	getLinkSuggestions(): ObsidianLinkSuggestion[] {
		// @ts-ignore
		return app.metadataCache.getLinkSuggestions()
	}

	getPathsToAllLoadedFolders(): ObsidianFolderPath[]{
		return app.vault.getAllLoadedFiles().filter(f => f instanceof TFolder).map(f => new ObsidianFolderPath(f.path))
	}

	getHeadersIn(filePath: string): HeadingCache[] {
		const file: TAbstractFile = app.metadataCache.getFirstLinkpathDest(filePath, app.workspace.getActiveFile().path)
		if (!(file instanceof TFile)) return []

		const headingCache = this.app.metadataCache.getFileCache(file).headings ?? []
		return headingCache
	}
}
