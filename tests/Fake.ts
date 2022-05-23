import {IObsidianInterop} from "../src/interop/ObsidianInterfaces"
import {TFile} from "obsidian"
import {LinkCreationCommand} from "../src/core/LinkCreationPreparer"

class FakeInterop implements IObsidianInterop{
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

}

export class Fake {
	static get Interop(){return new FakeInterop()}
}
