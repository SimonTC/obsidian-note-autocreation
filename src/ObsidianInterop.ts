import {IFileSystem, IMetadataCollection} from "./ObsidianInterfaces";
import {App, TFile, TFolder} from "obsidian";
import {NoteCreationCommand} from "./NoteCreationPreparer";
import {Suggestion} from "./Suggestion";

export class ObsidianInterop implements IMetadataCollection, IFileSystem {
	private readonly app: App;

	constructor(app: App) {
		this.app = app;
	}

	getUnresolvedLinks(): Record<string, Record<string, number>> {
		return app.metadataCache.unresolvedLinks;
	}

	folderExists(folderPath: string): boolean {
		const foundItem = app.vault.getAbstractFileByPath(folderPath)
		return foundItem && foundItem instanceof TFolder
	}

	noteExists(notePath: string): boolean {
		const foundItem = app.metadataCache.getFirstLinkpathDest(notePath, "")
		return foundItem !== null
	}

	async getOrCreateFileAndFoldersInPath(creationCommand: NoteCreationCommand, suggestion: Suggestion): Promise<TFile>{
		await this.createFolderIfNeeded(creationCommand)
		return await this.createOrGetFile(creationCommand, suggestion)
	}

	private async createOrGetFile(creationCommand: NoteCreationCommand, suggestion: Suggestion): Promise<TFile>{
		let file: TFile

		if (creationCommand.FileCreationNeeded){
			console.debug(`NAC: Note does not exist. Will be created. Path: ${creationCommand.PathToNewFile}`)
			file = await this.tryCreateFile(creationCommand.PathToNewFile, creationCommand.NoteContent)
		}

		return file ? file : app.metadataCache.getFirstLinkpathDest(suggestion.VaultPath, "")
	}

	private async createFolderIfNeeded(creationCommand: NoteCreationCommand){
		if (!creationCommand.FolderCreationNeeded){
			return
		}

		try{
			await app.vault.createFolder(creationCommand.PathToNewFolder)
		} catch (e) {
			// Folder apparently already exists.
			// This might happen if a folder of the same name but with different casing exist
			console.debug('NAC: Failed folder creation. Folder probably already exist.')
		}
	}

	private async tryCreateFile(filePath: string, fileContent: string): Promise<TFile> {
		try{
			return await app.vault.create(filePath, fileContent);
		} catch (e) {
			// File apparently already exists.
			// This might happen if a file of the same name but with different casing exist
			console.debug('NAC: Failed file creation. File probably already exist.')
		}

		return undefined;
	}
}
