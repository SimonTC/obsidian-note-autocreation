import {
	IFileSystem,
	IMetadataCollection,
	IObsidianInterop,
	ObsidianLinkSuggestion
} from "../src/interop/ObsidianInterfaces"
import {TFile} from "obsidian"
import {LinkCreationCommand} from "../src/core/LinkCreationPreparer"
import {NoteAutoCreatorSettings} from "../src/settings/NoteAutoCreatorSettings"

class FakeInterop implements IObsidianInterop {
	private metadataCollection: IMetadataCollection = Fake.MetaDataCollection

	withMetadataCollection(metadataCollection: IMetadataCollection): FakeInterop{
		this.metadataCollection = metadataCollection
		return this
	}

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
		return this.metadataCollection.getUnresolvedLinks()
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

	runTemplaterOn(file: TFile): Promise<void> {
		return Promise.resolve(undefined)
	}

	private _templaterIsEnabled = false

	enableTemplater(){
		this._templaterIsEnabled = true
	}

	get templaterIsEnabled(): boolean {
		return this._templaterIsEnabled
	}

	getLinkSuggestions(): ObsidianLinkSuggestion[] {
		return this.metadataCollection.getLinkSuggestions()
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

export class FakeMetadataCollection implements IMetadataCollection{
	private linkSuggestions: ObsidianLinkSuggestion[] = []
	private unresolvedLinks: Record<string, Record<string, number>> = {}

	getLinkSuggestions(): ObsidianLinkSuggestion[] {
		return this.linkSuggestions
	}

	getUnresolvedLinks(): Record<string, Record<string, number>> {
		return this.unresolvedLinks
	}

	withLinkSuggestions(linkSuggestions: ObsidianLinkSuggestion[]): FakeMetadataCollection {
		this.linkSuggestions = linkSuggestions
		return this
	}

	withUnresolvedLinks(unresolvedLinks: Record<string, Record<string, number>>): FakeMetadataCollection{
		this.unresolvedLinks = unresolvedLinks
		return this
	}

}

export class FakeSettings implements NoteAutoCreatorSettings{
	templateTriggerSymbol = '$'
	triggerSymbol = '@'
}

export class Fake {
	static get Interop() {
		return new FakeInterop()
	}

	static get FileSystem() {
		return new FakeFileSystem()
	}

	static get Settings(){
		return new FakeSettings()
	}

	static get MetaDataCollection(){
		return new FakeMetadataCollection()
	}
}


