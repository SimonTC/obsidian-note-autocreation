import {IMetadataCollection} from "../../interop/ObsidianInterfaces"
import {ExistingNoteSuggestion} from "../suggestions/NoteSuggestion"
import {HeaderSuggestion} from "../suggestions/HeaderSuggestion"
import {NoteAutoCreatorSettings} from "../../settings/NoteAutoCreatorSettings"

export class HeaderSuggestionCollector {
	private readonly metadataCollection: IMetadataCollection
	private readonly headerAsAliasTrigger: string

	constructor(metadataCollection: IMetadataCollection, settings: NoteAutoCreatorSettings) {
		this.metadataCollection = metadataCollection
		this.headerAsAliasTrigger = settings.triggerHeaderAsAliasSymbol
	}

	getSuggestions(headerQuery: string, noteSuggestion: ExistingNoteSuggestion): HeaderSuggestion[]{
		const [query, alias] = headerQuery.split('|')
		const lowerCaseQuery = query.toLowerCase()
		const headersInNote = this.metadataCollection.getHeadersIn(noteSuggestion.Path.VaultPath)
		let aliasToUse = noteSuggestion.Alias ? noteSuggestion.Alias : alias
		let validHeaders = headersInNote
			.filter(h => h.heading.toLowerCase().includes(lowerCaseQuery))
		let headerCanBeUsedAsAlias = false
		if (validHeaders.length === 0 && query.endsWith(this.headerAsAliasTrigger)){
			const queryWithoutBang = lowerCaseQuery.slice(0, query.length - 1)
			validHeaders = headersInNote.filter(h => h.heading.toLowerCase().includes(queryWithoutBang))
			headerCanBeUsedAsAlias = true
		}
		if (headerCanBeUsedAsAlias && validHeaders.length === 1 && !alias){
			aliasToUse = validHeaders[0].heading
		}
		return validHeaders
			.map(h => new HeaderSuggestion(h.heading, h.level, aliasToUse, noteSuggestion))
	}
}
