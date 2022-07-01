import {IMetadataCollection} from "../../interop/ObsidianInterfaces"
import {ExistingNoteSuggestion} from "../suggestions/NoteSuggestion"
import {HeaderSuggestion} from "../suggestions/HeaderSuggestion"

export class HeaderSuggestionCollector {
	private readonly metadataCollection: IMetadataCollection

	constructor(metadataCollection: IMetadataCollection) {
		this.metadataCollection = metadataCollection
	}

	getSuggestions(headerQuery: string, noteSuggestion: ExistingNoteSuggestion): HeaderSuggestion[]{
		const headersInNote = this.metadataCollection.getHeadersIn(noteSuggestion.VaultPath)
		return headersInNote.map(h => new HeaderSuggestion(h.heading, h.level))
	}
}
