import {
	AliasNoteSuggestion,
	ExistingNoteSuggestion,
	NewNoteSuggestion,
	NoteSuggestion
} from "../suggestions/NoteSuggestion"
import {IMetadataCollection} from "../../interop/ObsidianInterfaces"
import {NoteAutoCreatorSettings} from "../../settings/NoteAutoCreatorSettings"
import {FileQuery} from "../queries/FileQuery"
import {ISuggestionSource} from "./ISuggestionSource"

export class NoteSource implements ISuggestionSource<NoteSuggestion>{
	private metadata: IMetadataCollection
	private settings: NoteAutoCreatorSettings

	constructor(metadata: IMetadataCollection, settings: NoteAutoCreatorSettings) {
		this.metadata = metadata
		this.settings = settings
	}

	createSuggestionFromQuery(query: FileQuery, existingSuggestionForQuery: NoteSuggestion): NoteSuggestion {
		const queryAsSuggestion = new NewNoteSuggestion(query.query)
		if (existingSuggestionForQuery){
			const suggestionToAdd = queryAsSuggestion.HasAlias
				? new ExistingNoteSuggestion(`${existingSuggestionForQuery.VaultPath}|${queryAsSuggestion.Alias}`)
				: existingSuggestionForQuery

			return suggestionToAdd
		} else{
			return queryAsSuggestion
		}
	}

	getAllPossibleSuggestions(query: string): NoteSuggestion[]{
		const observedPaths = new Set<string>()
		const suggestions: NoteSuggestion[] = []
		const addIfPathHasNotBeSeen = (path: string, exist: boolean, alias: string | unknown) => {
			const pathHasBeenSeen = observedPaths.has(path)
			if (alias || !pathHasBeenSeen){
				suggestions.push(this.createSuggestion(path, alias, exist, query))
				observedPaths.add(path)
			}
			return !pathHasBeenSeen
		}

		const linkSuggestions = this.metadata.getLinkSuggestions()
		for (const linkSuggestion of linkSuggestions) {
			addIfPathHasNotBeSeen(linkSuggestion.path, linkSuggestion.file !== null, linkSuggestion.alias)
		}

		if(this.settings.suggestLinksToNonExistingNotes){
			return suggestions
		} else{
			return suggestions.filter(suggestion => suggestion.ForExistingNote)
		}
	}

	private createSuggestion(path: string, alias: string | unknown, pathIsToExistingNote: boolean, trigger: string): NoteSuggestion{
		if(pathIsToExistingNote){
			if (alias && (alias as string).toLowerCase().includes(trigger)){
				return new AliasNoteSuggestion(path, alias as string)
			} else {
				return new ExistingNoteSuggestion(path)
			}
		} else {
			return new NewNoteSuggestion(path)
		}
	}
}
