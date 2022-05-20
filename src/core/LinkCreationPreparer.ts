import {Suggestion} from "./Suggestion"
import {IConfigurationStore, IFile, IFileSystem} from "../interop/ObsidianInterfaces"

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

	prepareNoteCreationFor(suggestion: Suggestion, currentFile: IFile): LinkCreationCommand{
		const noteExists = this.fileSystem.noteExists(suggestion.VaultPath)

		if (noteExists){
			return this.createLinkToExistingNote(suggestion)
		}

		if(suggestion.NoteIsInRoot && suggestion.Title !== '' && !suggestion.Trigger.startsWith('/')){
			return this.createLinkToNoteInDefaultLocation(suggestion, currentFile)
		}

		return this.createLinkToNoteInSubfolder(suggestion, noteExists)
	}

	private createLinkToNoteInSubfolder(suggestion: Suggestion, noteExists: boolean) {
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

	private createLinkToNoteInDefaultLocation(suggestion: Suggestion, currentFile: IFile): LinkCreationCommand {
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

	private createLinkToExistingNote(suggestion: Suggestion): LinkCreationCommand {
		return {
			FolderCreationCommand: undefined,
			NoteCreationCommand: undefined,
			NoteAlias: suggestion.Alias,
			FullPath: suggestion.VaultPath
		}
	}

	private getFileName(suggestion: Suggestion): string{
		return suggestion.VaultPath.endsWith('.md')
			? suggestion.VaultPath
			: `${suggestion.VaultPath}.md`
	}

	private getPathToFileInDefaultFolder(suggestion: Suggestion, currentFile: IFile): string{
		const defaultNoteLocation = this.configStore.getValueFor('newFileLocation')
		console.debug(`NAC: default note location is ${defaultNoteLocation}`)

		const pathInRoot = `${suggestion.Title}.md`
		switch (defaultNoteLocation) {
			case 'current':
			{
				const suggestionForCurrentFile = new Suggestion(currentFile.path)
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
