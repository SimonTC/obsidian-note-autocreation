import {IMetadataCollection} from "../../interop/ObsidianInterfaces"
import {ExistingNoteSuggestion} from "../suggestions/NoteSuggestion"
import {HeaderSuggestion} from "../suggestions/HeaderSuggestion"

export class HeaderSuggestionCollector {
	private readonly metadataCollection: IMetadataCollection

	constructor(metadataCollection: IMetadataCollection) {
		this.metadataCollection = metadataCollection
	}

	getSuggestions(headerQuery: string, noteSuggestion: ExistingNoteSuggestion): HeaderSuggestion[]{
		return []
	}
}
