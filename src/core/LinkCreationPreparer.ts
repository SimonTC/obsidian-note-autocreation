import {ExistingNoteSuggestion, NoteSuggestion} from "./suggestions/NoteSuggestion"
import {IConfigurationStore, IFileSystem} from "../interop/ObsidianInterfaces"
import {TFile} from "obsidian"

export type FolderCreationCommand = {
	PathToNewFolder: string
}

export type NoteCreationCommand = {
	NoteContent: string,
	PathToNewFile: string
}

export type LinkCreationCommand = {
	FolderCreationCommand: FolderCreationCommand | undefined,
	NoteCreationCommand: NoteCreationCommand | undefined,
	NoteAlias: string | undefined
	FullPath: string
}

export class LinkCreationPreparer {
	private fileSystem: IFileSystem
	private configStore: IConfigurationStore

	constructor(fileSystem: IFileSystem, configStore: IConfigurationStore) {
		this.fileSystem = fileSystem
		this.configStore = configStore
	}

	prepareNoteCreationForEmptyNote(suggestion: NoteSuggestion, currentFile: TFile): LinkCreationCommand{
		const noteExists = this.fileSystem.noteExists(suggestion.VaultPath)

		if (noteExists){
			return this.createLinkToExistingNote(suggestion)
		}

		if(suggestion.NoteIsInRoot && suggestion.Title !== '' && !suggestion.Trigger.startsWith('/')){
			return this.createLinkToNoteInDefaultLocation(suggestion, currentFile)
		}

		return this.createLinkToNoteInSubfolder(suggestion, noteExists)
	}

	private createLinkToNoteInSubfolder(suggestion: NoteSuggestion, noteExists: boolean) {
		const fileCreationNeeded = suggestion.Title !== '' && !noteExists
		const folderCreationNeeded = suggestion.FolderPath !== '' && !this.fileSystem.folderExists(suggestion.FolderPath)

		const folderCreationCmd = folderCreationNeeded
			? {PathToNewFolder: suggestion.FolderPath}
			: undefined

		const noteCreationCmd = fileCreationNeeded
			? {NoteContent: '', PathToNewFile: this.getFileName(suggestion)}
			: undefined

		return {
			FolderCreationCommand: folderCreationCmd,
			NoteCreationCommand: noteCreationCmd,
			NoteAlias: suggestion.Alias,
			FullPath: suggestion.VaultPath
		}
	}

	private createLinkToNoteInDefaultLocation(suggestion: NoteSuggestion, currentFile: TFile): LinkCreationCommand {
		const noteCreationCmd = {
			NoteContent: '',
			PathToNewFile: this.getPathToFileInDefaultFolder(suggestion, currentFile)
		}
		return {
			FolderCreationCommand: undefined,
			NoteCreationCommand: noteCreationCmd,
			NoteAlias: suggestion.Alias,
			FullPath: noteCreationCmd.PathToNewFile
		}
	}

	private createLinkToExistingNote(suggestion: NoteSuggestion): LinkCreationCommand {
		return {
			FolderCreationCommand: undefined,
			NoteCreationCommand: undefined,
			NoteAlias: suggestion.Alias,
			FullPath: suggestion.VaultPath
		}
	}

	private getFileName(suggestion: NoteSuggestion): string{
		return suggestion.VaultPath.endsWith('.md')
			? suggestion.VaultPath
			: `${suggestion.VaultPath}.md`
	}

	private getPathToFileInDefaultFolder(suggestion: NoteSuggestion, currentFile: TFile): string{
		const defaultNoteLocation = this.configStore.getValueFor('newFileLocation')
		console.debug(`NAC: default note location is ${defaultNoteLocation}`)

		const pathInRoot = `${suggestion.Title}.md`
		switch (defaultNoteLocation) {
			case 'current':
			{
				const suggestionForCurrentFile = new ExistingNoteSuggestion(currentFile.path)
				return suggestionForCurrentFile.NoteIsInRoot
					? pathInRoot
					: `${suggestionForCurrentFile.FolderPath}/${suggestion.Title}.md`
			}
			case 'folder':{
				const defaultFolder = this.configStore.getValueFor('newFileFolderPath')
				return defaultFolder && defaultFolder.length > 0 && this.fileSystem.folderExists(defaultFolder)
					? `${defaultFolder}/${suggestion.Title}.md`
					: pathInRoot
			}
			case 'root':
			default:
				// On default we assume that new files are created in root
				return pathInRoot
		}
	}
}
