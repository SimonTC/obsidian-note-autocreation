import {ExistingNoteSuggestion, NewNoteSuggestion, NoteSuggestion} from "../suggestions/NoteSuggestion"
import {IFileSystem, IMetadataCollection, IObsidianInterop} from "../../interop/ObsidianInterfaces"
import {BaseSuggestionCollector} from "./BaseSuggestionCollector"
import {TemplateSuggestion} from "../suggestions/TemplateSuggestion"
import {Suggestion} from "../suggestions/Suggestion"

export class SuggestionCollector{
	private readonly noteSuggestionCollector: NoteSuggestionCollector
	private readonly templateSuggestionCollector: TemplateSuggestionCollector
	private readonly fileSystem: IFileSystem

	constructor(interOp: IObsidianInterop) {
		this.noteSuggestionCollector = new NoteSuggestionCollector(interOp)
		this.templateSuggestionCollector = new TemplateSuggestionCollector(interOp)
		this.fileSystem = interOp
	}

	private getNoteSuggestionFor(query: string){
		const tempSuggestion = new ExistingNoteSuggestion(query)
		return this.fileSystem.noteExists(tempSuggestion.VaultPath)
			? tempSuggestion
			: new NewNoteSuggestion(query)
	}

	getSuggestions(query: string): Suggestion[] {
		if (query.includes('$')){
			const [noteQuery, templateQuery] = query.split('$')
			const noteSuggestion = this.getNoteSuggestionFor(noteQuery)
			return this.templateSuggestionCollector.getSuggestions(templateQuery, noteSuggestion)
		}

		return this.noteSuggestionCollector.getSuggestions(query)
	}
}

export class NoteSuggestionCollector {
	private metadata: IMetadataCollection
	private collector: BaseSuggestionCollector<NoteSuggestion>

	constructor(metadata: IMetadataCollection) {
		this.metadata = metadata
		this.collector = new BaseSuggestionCollector({
			getAllPossibleLinks: () => this.getVaultPathsOfAllLinks(),
			createSuggestion: query => new ExistingNoteSuggestion(query),
			createSuggestionForQuery: query => new NewNoteSuggestion(query),
			createSuggestionWhenSuggestionForQueryAlreadyExists: collection => new ExistingNoteSuggestion(`${collection.existingSuggestionForQuery.VaultPath}|${collection.queryAsSuggestion.Alias}`)
		})
	}

	getSuggestions(query: string): NoteSuggestion[] {
		return this.collector.getSuggestions(query)
	}

	private getVaultPathsOfAllLinks(): Set<string> {
		const unresolvedLinks: Record<string, Record<string, number>> = this.metadata.getUnresolvedLinks()

		const vaultPaths = new Set<string>()
		for (const pathToFileWithPossibleUnresolvedLink in unresolvedLinks) {
			vaultPaths.add(pathToFileWithPossibleUnresolvedLink)

			for (const unresolvedLink in unresolvedLinks[pathToFileWithPossibleUnresolvedLink]) {
				vaultPaths.add(unresolvedLink)
			}
		}
		return vaultPaths
	}
}

export class TemplateSuggestionCollector{
	private readonly fileSystem: IFileSystem
	private readonly templateFolderPath = '_templates'

	constructor(fileSystem: IFileSystem) {
		this.fileSystem = fileSystem
	}

	getSuggestions(templateQuery: string, noteSuggestion: NoteSuggestion): Suggestion[] {
		const collector = new BaseSuggestionCollector({
			getAllPossibleLinks: () => new Set(this.fileSystem.getAllFileDescendantsOf(this.templateFolderPath).map(f => f.path)),
			createSuggestion: query => new TemplateSuggestion(query, noteSuggestion),
			createSuggestionForQuery: query => new TemplateSuggestion(query, noteSuggestion),
			createSuggestionWhenSuggestionForQueryAlreadyExists: collection => collection.existingSuggestionForQuery
		})

		return collector.getSuggestions(templateQuery)
	}
}
