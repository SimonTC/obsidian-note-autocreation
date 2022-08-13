import {
	IEditor,
	IEditorSuggestContext,
	IFileSystem,
	IMetadataCollection,
	IObsidianInterop,
	ObsidianLinkSuggestion
} from "../src/interop/ObsidianInterfaces"
import {HeadingCache, Pos, TFile} from "obsidian"
import {LinkCreationCommand} from "../src/core/LinkCreationPreparer"
import {NoteAutoCreatorSettings} from "../src/settings/NoteAutoCreatorSettings"
import {ObsidianFilePath} from "../src/core/ObsidianFilePath"

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

	getHeadersIn(filePath: string): HeadingCache[] {
		return this.metadataCollection.getHeadersIn(filePath)
	}

	getFile(filePath: ObsidianFilePath, currentFile: TFile): TFile | null {
		return null
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

	getFile(filePath: ObsidianFilePath, currentFile: TFile): TFile | null {
		return null
	}

}

export class FakeMetadataCollection implements IMetadataCollection{
	private linkSuggestions: ObsidianLinkSuggestion[] = []
	private unresolvedLinks: Record<string, Record<string, number>> = {}
	private headersByPath: Map<string, HeadingCache[]> = new Map<string, HeadingCache[]>()

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

	withHeaders(headersByPath: Map<string, HeadingCache[]>): FakeMetadataCollection{
		this.headersByPath = headersByPath
		return this
	}

	getHeadersIn(filePath: string): HeadingCache[] {
		if (this.headersByPath.has(filePath)){
			return this.headersByPath.get(filePath)
		}
		return []
	}

}

export class FakeSettings implements NoteAutoCreatorSettings{
	templateTriggerSymbol = '$'
	triggerSymbol = '@'
	suggestLinksToNonExistingNotes = true
}

export class FakeObsidianLinkSuggestion implements ObsidianLinkSuggestion{
	alias: string | unknown = undefined
	file: TFile | null = null
	path: string = undefined

	withAlias(alias: string): FakeObsidianLinkSuggestion{
		this.alias = alias
		return this
	}

	withPath(path: string): FakeObsidianLinkSuggestion{
		this.path = path
		return this
	}

	withFile(file: TFile): FakeObsidianLinkSuggestion{
		this.file = file
		return this
	}
}

export class FakeHeadingCache implements HeadingCache{
	heading: string
	level: number
	position: Pos

	withTitle(title: string): FakeHeadingCache{
		this.heading = title
		return this
	}

	withLevel(level: number): FakeHeadingCache{
		this.level = level
		return this
	}
}

export class FakeEditorSuggestionContext implements IEditorSuggestContext{
	editor: IEditor = null
	file: TFile = null
	query = ''

	constructor(query: string) {
		this.query = query
	}

	withEditor(editor: IEditor): FakeEditorSuggestionContext{
		this.editor = editor
		return this
	}

	withFile(file: TFile): FakeEditorSuggestionContext{
		this.file = file
		return this
	}
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

	static LinkToExistingNote(notePath: string){
		return new FakeObsidianLinkSuggestion().withPath(notePath).withFile(<TFile>{})
	}

	static LinkToNotExistingNote(notePath: string){
		return new FakeObsidianLinkSuggestion().withPath(notePath)
	}

	static get HeadingCache(){
		return new FakeHeadingCache()
	}

	static EditorSuggestionContext(query: string){
		return new FakeEditorSuggestionContext(query)
	}
}


