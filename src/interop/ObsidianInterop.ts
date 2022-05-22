import {IObsidianInterop} from "./ObsidianInterfaces"
import {App, TFile, TFolder} from "obsidian"
import {FolderCreationCommand, LinkCreationCommand, NoteCreationCommand} from "../core/LinkCreationPreparer"

export class ObsidianInterop implements IObsidianInterop {
	private readonly app: App

	constructor(app: App) {
		this.app = app
	}

	generateMarkdownLink(file: TFile, sourcePath: string, subpath?: string, alias?: string): string {
        return this.app.fileManager.generateMarkdownLink(file, sourcePath, subpath, alias)
    }

	getUnresolvedLinks(): Record<string, Record<string, number>> {
		return app.metadataCache.unresolvedLinks
	}

	folderExists(folderPath: string): boolean {
		const foundItem = app.vault.getAbstractFileByPath(folderPath)
		return foundItem && foundItem instanceof TFolder
	}

	noteExists(notePath: string): boolean {
		const foundItem = app.vault.getAbstractFileByPath(notePath)
		return foundItem && foundItem instanceof TFile
	}

	async getOrCreateFileAndFoldersInPath(creationCommand: LinkCreationCommand, currentFile: TFile): Promise<TFile>{
		if (creationCommand.FolderCreationCommand){
			await this.createFolderIfNeeded(creationCommand.FolderCreationCommand)
		}

		if (creationCommand.NoteCreationCommand){
			return await this.tryCreateFile(creationCommand.NoteCreationCommand)
		} else {
			return app.metadataCache.getFirstLinkpathDest(creationCommand.FullPath, currentFile.path)
		}
	}

	private async createFolderIfNeeded(creationCommand: FolderCreationCommand){
		try{
			await app.vault.createFolder(creationCommand.PathToNewFolder)
		} catch (e) {
			// Folder apparently already exists.
			// This might happen if a folder of the same name but with different casing exist
			console.debug('NAC: Failed folder creation. Folder probably already exist.')
		}
	}

	private async tryCreateFile(creationCommand: NoteCreationCommand): Promise<TFile> {
		console.debug(`NAC: Note does not exist. Will be created. Path: ${creationCommand.PathToNewFile}`)

		try{
			return await app.vault.create(creationCommand.PathToNewFile, creationCommand.NoteContent)
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
}
