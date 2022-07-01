import {IMetadataCollection} from "../../interop/ObsidianInterfaces"
import {ExistingNoteSuggestion} from "../suggestions/NoteSuggestion"
import {HeaderSuggestion} from "../suggestions/HeaderSuggestion"

export class HeaderSuggestionCollector {
	private readonly metadataCollection: IMetadataCollection

	constructor(metadataCollection: IMetadataCollection) {
		this.metadataCollection = metadataCollection
	}

	getSuggestions(headerQuery: string, noteSuggestion: ExistingNoteSuggestion): HeaderSuggestion[]{
		const [query, alias] = headerQuery.split('|')
		const headersInNote = this.metadataCollection.getHeadersIn(noteSuggestion.Path.VaultPath)
		const aliasToUse = noteSuggestion.Alias ? noteSuggestion.Alias : alias
		return headersInNote.map(h => new HeaderSuggestion(h.heading, h.level, aliasToUse, noteSuggestion))
	}
}
