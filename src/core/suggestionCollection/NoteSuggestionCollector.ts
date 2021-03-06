import {
	AliasNoteSuggestion,
	ExistingNoteSuggestion,
	NewNoteSuggestion,
	NoteSuggestion
} from "../suggestions/NoteSuggestion"
import {IMetadataCollection} from "../../interop/ObsidianInterfaces"
import {NoteAutoCreatorSettings} from "../../settings/NoteAutoCreatorSettings"
import {FileSuggestion} from "../suggestions/FileSuggestion"
import {Query} from "../queries/FileQuery"

export class NoteSuggestionCollector {
	private metadata: IMetadataCollection
	private settings: NoteAutoCreatorSettings

	constructor(metadata: IMetadataCollection, settings: NoteAutoCreatorSettings) {
		this.metadata = metadata
		this.settings = settings
	}

	getSuggestions(query: string): NoteSuggestion[] {
		const queryObject = Query.forNoteSuggestions(query)
		let existingSuggestionForQuery: NoteSuggestion
		const validSuggestions: NoteSuggestion[] = []

		for (const suggestion of this.getAllPossibleSuggestions(query)) {
			if (suggestion.ForExistingNote || this.settings.suggestLinksToNonExistingNotes){
				const queryResult = queryObject.couldBeQueryFor(suggestion)

				if (queryResult.isCompleteMatch){
					existingSuggestionForQuery = suggestion
					continue
				}

				if (queryResult.isAtLeastPartialMatch){
					validSuggestions.push(suggestion)
				}
			}
		}

		validSuggestions.sort(FileSuggestion.compare)

		if (query === '') {
			return validSuggestions
		}

		const queryAsSuggestion = new NewNoteSuggestion(query)
		if (existingSuggestionForQuery){
			const suggestionToAdd = queryAsSuggestion.HasAlias
				? new ExistingNoteSuggestion(`${existingSuggestionForQuery.VaultPath}|${queryAsSuggestion.Alias}`)
				: existingSuggestionForQuery

			validSuggestions.unshift(suggestionToAdd)
		} else{
			validSuggestions.unshift(queryAsSuggestion)
		}

		return validSuggestions
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

	private getAllPossibleSuggestions(trigger: string): NoteSuggestion[]{
		const observedPaths = new Set<string>()
		const suggestions: NoteSuggestion[] = []
		const addIfPathHasNotBeSeen = (path: string, exist: boolean, alias: string | unknown) => {
			const pathHasBeenSeen = observedPaths.has(path)
			if (alias || !pathHasBeenSeen){
				suggestions.push(this.createSuggestion(path, alias, exist, trigger))
				observedPaths.add(path)
			}
			return !pathHasBeenSeen
		}

		const linkSuggestions = this.metadata.getLinkSuggestions()
		for (const linkSuggestion of linkSuggestions) {
			addIfPathHasNotBeSeen(linkSuggestion.path, linkSuggestion.file !== null, linkSuggestion.alias)
		}
		return suggestions
	}
}

