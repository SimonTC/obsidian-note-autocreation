import {
	IEditor,
	IEditorSuggestContext,
	IFileSystem,
	IMetadataCollection,
	IObsidianInterop,
	ObsidianLinkSuggestion
} from "../src/interop/ObsidianInterfaces"
import {FileStats, HeadingCache, Pos, TAbstractFile, TFile, TFolder, Vault} from "obsidian"
import {LinkCreationCommand} from "../src/core/LinkCreationPreparer"
import {FolderSuggestionSettings, NoteAutoCreatorSettings} from "../src/settings/NoteAutoCreatorSettings"
import {FileQuery} from "../src/core/queries/FileQuery"
import {ObsidianFilePath} from "../src/core/paths/ObsidianFilePath"
import {ObsidianFolderPath} from "../src/core/paths/ObsidianFolderPath"
import {ITemplateConfig} from "../src/core/suggestionCollection/TemplateSuggestionCollector"

class FakeInterop implements IObsidianInterop {
	private metadataCollection: IMetadataCollection = Fake.MetaDataCollection
	private fileSystem: IFileSystem = Fake.FileSystem

	withMetadataCollection(metadataCollection: IMetadataCollection): FakeInterop{
		this.metadataCollection = metadataCollection
		return this
	}

	withFileSystem(fileSystem: IFileSystem): FakeInterop{
		this.fileSystem = fileSystem
		return this
	}

	generateMarkdownLink(file: TFile, sourcePath: string, subpath?: string, alias?: string): string {
		return ""
	}

	getAllFileDescendantsOf(folderPath: string): TFile[] {
		return this.fileSystem.getAllFileDescendantsOf(folderPath)
	}

	getOrCreateFileAndFoldersInPath(creationCommand: LinkCreationCommand, currentFile: TFile): Promise<TFile> {
		return this.fileSystem.getOrCreateFileAndFoldersInPath(creationCommand, currentFile)
	}

	getUnresolvedLinks(): Record<string, Record<string, number>> {
		return this.metadataCollection.getUnresolvedLinks()
	}

	getValueFor(configKey: string): any {
	}

	noteExists(notePath: string): boolean {
		return this.fileSystem.noteExists(notePath)
	}

	getCoreTemplatesPath(): string | undefined {
		return undefined
	}

	getTemplaterTemplatesPath(): string | undefined {
		return undefined
	}

	getFileContentOf(filePath: string): Promise<string> {
		return this.fileSystem.getFileContentOf(filePath)
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

	getFile = this.fileSystem.getFile

	getPathsToAllLoadedFolders(): ObsidianFolderPath[]{
		return this.fileSystem.getPathsToAllLoadedFolders()
	}

	folderExists(folderPath: ObsidianFolderPath): boolean {
		return this.fileSystem.folderExists(folderPath)
	}
}

class FakeFileSystem implements IFileSystem {
	folderExists(folderPath: ObsidianFolderPath): boolean {
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

	getPathsToAllLoadedFolders(): ObsidianFolderPath[] {
		return this.folderPaths
	}

	private folderPaths: ObsidianFolderPath[] = []

	withFolders(folderPaths: string[]): FakeFileSystem{
		this.folderPaths = folderPaths.map(s => new ObsidianFolderPath(s))
		return this
	}
}

export class FakeMetadataCollection implements IMetadataCollection{
	private linkSuggestions: ObsidianLinkSuggestion[]
	private unresolvedLinks: Record<string, Record<string, number>>
	private headersByPath: Map<string, HeadingCache[]>

	constructor() {
		this.linkSuggestions = []
		this.unresolvedLinks = {}
		this.headersByPath = new Map<string, HeadingCache[]>()
	}

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
	relativeTopFolders: ObsidianFolderPath[] = []
	includeFoldersInSuggestions = false
	folderSuggestionSettings = <FolderSuggestionSettings>{}
	enableRelativePaths = true
	defaultTemplaterTemplate = ""
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

export class FakeFolder implements TFolder{
	children: TAbstractFile[] = []
	name: string
	parent: TFolder
	path: string
	vault: Vault

	isRoot(): boolean {
		return this.folderPath.IsRoot
	}

	private readonly folderPath: ObsidianFolderPath

	constructor(folderPath: ObsidianFolderPath) {
		this.folderPath = folderPath
	}
}

export class FakeFile implements TFile{
	get basename() {return this.filePath.Title}
	get extension() {return this.filePath.Extension}
	get name() {return this.filePath.FileNameWithPossibleExtension}
	get parent() {return new FakeFolder(this.filePath.FolderPath)}
	get path() {return this.filePath.VaultPath}
	stat: FileStats = null
	vault: Vault = null

	private readonly filePath: ObsidianFilePath

	constructor(path: string) {
		this.filePath = new ObsidianFilePath(path)
	}
}

export class FakeTemplateConfig implements ITemplateConfig{
	private readonly defaultTemplatePath: string
	private readonly templateFolderPath: string

	constructor(defaultTemplatePath: string, templateFolderPath: string) {
		this.defaultTemplatePath = defaultTemplatePath
		this.templateFolderPath = templateFolderPath
	}
	getDefaultTemplate(): string {
		return this.defaultTemplatePath
	}

	getTemplateFolderPath(): string {
		return this.templateFolderPath
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

	static NoteQuery(query: string){
		return FileQuery.forNoteSuggestions(Fake.EditorSuggestionContext(query), Fake.Settings)
	}

	static File(filePath: string){
		return new FakeFile(filePath)
	}

	static Folder (folderPath: string){
		return new FakeFolder(new ObsidianFolderPath(folderPath))
	}
}


