import {IConfigurationStore, IFileSystem, IObsidianInterop, ObsidianLinkSuggestion} from "./ObsidianInterfaces"
import {App, HeadingCache, TAbstractFile, TFile} from "obsidian"
import {FolderCreationCommand, LinkCreationCommand, NoteCreationCommand} from "../core/LinkCreationPreparer"
import {ObsidianFilePath} from "../core/paths/ObsidianFilePath"
import {ObsidianFolderPath} from "../core/paths/ObsidianFolderPath"

export class ObsidianInterop implements IObsidianInterop {
	private readonly app: App
	private readonly configStore: IConfigurationStore
	private readonly fileSystem: IFileSystem

	constructor(app: App, configStore: IConfigurationStore, fileSystem: IFileSystem) {
		this.app = app
		this.configStore = configStore
		this.fileSystem = fileSystem
	}

	async getFileContentOf(filePath: string): Promise<string> {
		return this.fileSystem.getFileContentOf(filePath)
    }

	generateMarkdownLink(file: TFile, sourcePath: string, subpath?: string, alias?: string): string {
        return this.fileSystem.generateMarkdownLink(file, sourcePath, subpath, alias)
    }

	getUnresolvedLinks(): Record<string, Record<string, number>> {
		return this.app.metadataCache.unresolvedLinks
	}

	folderExists(folderPath: ObsidianFolderPath): boolean {
		return this.fileSystem.folderExists(folderPath)
	}

	noteExists(notePath: string): boolean {
		return this.fileSystem.noteExists(notePath)
	}

	getAllFileDescendantsOf(folderPath: string): TFile[]{
		return this.fileSystem.getAllFileDescendantsOf(folderPath)
	}

	async getOrCreateFileAndFoldersInPath(creationCommand: LinkCreationCommand, currentFile: TFile): Promise<TFile>{
		return this.fileSystem.getOrCreateFileAndFoldersInPath(creationCommand, currentFile)
	}

	getFile(filePath: ObsidianFilePath, currentFile: TFile): TFile | null{
		return this.getFile(filePath, currentFile)
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

	async runTemplaterOn(file: TFile){
		// @ts-ignore
		const templater = this.app.plugins.plugins["templater-obsidian"]

		if (templater) {
			await templater.templater.overwrite_file_commands(file)
		}
	}

	getLinkSuggestions(): ObsidianLinkSuggestion[] {
		// @ts-ignore
		return app.metadataCache.getLinkSuggestions()
	}

	getPathsToAllLoadedFolders(): ObsidianFolderPath[]{
		return this.fileSystem.getPathsToAllLoadedFolders()
	}

	getHeadersIn(filePath: string): HeadingCache[] {
		const file: TAbstractFile = app.metadataCache.getFirstLinkpathDest(filePath, app.workspace.getActiveFile().path)
		if (!(file instanceof TFile)) return []

		const headingCache = this.app.metadataCache.getFileCache(file).headings ?? []
		return headingCache
	}

	getCoreTemplatesPath(): string | undefined {
		return this.configStore.getCoreTemplatesPath()
	}

	getTemplaterTemplatesPath(): string | undefined {
		return this.configStore.getTemplaterTemplatesPath()
	}

	getValueFor(configKey: string): unknown {
		return this.configStore.getValueFor(configKey)
	}

	get templaterIsEnabled(): boolean {
		return this.configStore.templaterIsEnabled
	}
}
