import {IFileSystem, IObsidianInterop} from "../src/interop/ObsidianInterfaces"
import {TFile} from "obsidian"
import {LinkCreationCommand} from "../src/core/LinkCreationPreparer"

class FakeInterop implements IObsidianInterop {
	folderExists(folderPath: string): boolean {
		return false
	}

	generateMarkdownLink(file: TFile, sourcePath: string, subpath?: string, alias?: string): string {
		return ""
	}

	getAllFileDescendantsOf(folderPath: string): TFile[] {
		return []
	}

	getOrCreateFileAndFoldersInPath(creationCommand: LinkCreationCommand, currentFile: TFile): Promise<TFile> {
		return Promise.resolve(undefined)
	}

	getUnresolvedLinks(): Record<string, Record<string, number>> {
		return undefined
	}

	getValueFor(configKey: string): any {
	}

	noteExists(notePath: string): boolean {
		return false
	}

	getCoreTemplatesPath(): string | undefined {
		return undefined
	}

	getTemplaterTemplatesPath(): string | undefined {
		return undefined
	}

	getFileContentOf(filePath: string): Promise<string> {
		return Promise.resolve("")
	}
}

class FakeFileSystem implements IFileSystem {
	folderExists(folderPath: string): boolean {
		return false
	}

	generateMarkdownLink(file: TFile, sourcePath: string, subpath?: string, alias?: string): string {
		return ""
	}

	getAllFileDescendantsOf(folderPath: string): TFile[] {
		if (this.descendantsByFolderPath.has(folderPath)){
			return this.descendantsByFolderPath.get(folderPath).map(filePath => <TFile>{path: filePath})
		}
		return []
	}

	getOrCreateFileAndFoldersInPath(creationCommand: LinkCreationCommand, currentFile: TFile): Promise<TFile> {
		return Promise.resolve(undefined)
	}

	noteExists(notePath: string): boolean {
		return false
	}

	private descendantsByFolderPath = new Map<string, string[]>()

	withDescendantsOf(folderPath: string, fileNames: string[]): FakeFileSystem{
		this.descendantsByFolderPath.set(folderPath, fileNames)
		return this
	}

	getFileContentOf(filePath: string): Promise<string> {
		return Promise.resolve("")
	}

}

export class Fake {
	static get Interop() {
		return new FakeInterop()
	}

	static get FileSystem() {
		return new FakeFileSystem()
	}
}
