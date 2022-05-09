import {Suggestion} from "./Suggestion";
import {IFileSystem} from "./ObsidianInterfaces";

export type NoteCreationCommand = {
	NoteContent: string;
	PathToNewFolder: string;
	PathToNewFile: string;
	FileCreationNeeded: boolean,
	FolderCreationNeeded: boolean,
}

export class NoteCreationPreparer {
	private fileSystem: IFileSystem
	
	constructor(fileSystem: IFileSystem) {
		this.fileSystem = fileSystem;
	}
	
	prepareNoteCreationFor(suggestion: Suggestion): NoteCreationCommand{
		const fileCreationNeeded = suggestion.Title !== '' && !this.fileSystem.noteExists(suggestion.VaultPath);
		const folderCreationNeeded = suggestion.FolderPath !== '' && !this.fileSystem.folderExists(suggestion.FolderPath);

		return {
			PathToNewFile: fileCreationNeeded ? this.getFileName(suggestion) : undefined,
			PathToNewFolder: folderCreationNeeded ? suggestion.FolderPath : undefined,
			FileCreationNeeded: fileCreationNeeded,
			FolderCreationNeeded: folderCreationNeeded,
			NoteContent: `# ${suggestion.Title}`
		}
	}

	private getFileName(suggestion: Suggestion): string{
		return suggestion.VaultPath.endsWith('.md')
			? suggestion.VaultPath
			: `${suggestion.VaultPath}.md`
	}
}
