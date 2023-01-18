import {IFileSystem} from "./ObsidianInterfaces"
import {App, TAbstractFile, TFile, TFolder, Vault} from "obsidian"
import {FolderCreationCommand, LinkCreationCommand, NoteCreationCommand} from "../core/LinkCreationPreparer"
import {ObsidianFilePath} from "../core/paths/ObsidianFilePath"
import {ObsidianFolderPath} from "../core/paths/ObsidianFolderPath"

export class ObsidianFileSystem implements IFileSystem{

	private readonly app: App

	constructor(app:App) {
		this.app = app
	}

	folderExists(folderPath: ObsidianFolderPath): boolean {
		const foundItem = this.app.vault.getAbstractFileByPath(folderPath.VaultPath)
		return foundItem && foundItem instanceof TFolder
	}

	generateMarkdownLink(file: TFile, sourcePath: string, subpath?: string, alias?: string): string {
		return this.app.fileManager.generateMarkdownLink(file, sourcePath, subpath, alias)
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

	getFile(filePath: ObsidianFilePath, currentFile: TFile): TFile | null{
		return this.app.metadataCache.getFirstLinkpathDest(filePath.VaultPath, currentFile.path)
	}

	async getFileContentOf(filePath: string): Promise<string> {
		const file: TAbstractFile = this.app.vault.getAbstractFileByPath(filePath)
		if (!(file instanceof TFile)) return

		return await this.app.vault.cachedRead(file)
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

	getPathsToAllLoadedFolders(): ObsidianFolderPath[]{
		return app.vault.getAllLoadedFiles().filter(f => f instanceof TFolder).map(f => new ObsidianFolderPath(f.path))
	}

	noteExists(notePath: string): boolean {
		const foundItem = app.metadataCache.getFirstLinkpathDest(notePath, app.workspace.getActiveFile().path)
		return foundItem && foundItem instanceof TFile
	}

}
