import {ISuggestion, Suggestion} from "../suggestions/ISuggestion"
import {Query} from "../queries/Query"
import {ISuggestionSource} from "./ISuggestionSource"
import {NoteSuggestion} from "../suggestions/NoteSuggestion"
import {IFileSystem, IMetadataCollection, IObsidianInterop} from "../../interop/ObsidianInterfaces"
import {NoteAutoCreatorSettings} from "../../settings/NoteAutoCreatorSettings"
import {NoteSource} from "./NoteSource"
import {FolderSuggestion} from "../suggestions/FolderSuggestion"
import {FolderSource} from "./FolderSource"
import {NoteAndFolderSource} from "./NoteAndFolderSource"

export class BaseSuggestionCollector<TSuggestion extends ISuggestion>{
	private readonly suggestionSource: ISuggestionSource<TSuggestion>

	constructor(suggestionSource: ISuggestionSource<TSuggestion>) {
		this.suggestionSource = suggestionSource
	}

	getSuggestions(query: Query<TSuggestion>): TSuggestion[] {
		let existingSuggestionForQuery: TSuggestion
		const validSuggestions: TSuggestion[] = []

		for (const suggestion of this.suggestionSource.getAllPossibleSuggestions(query.query)) {
			const queryResult = query.couldBeQueryFor(suggestion)

			if (queryResult.isCompleteMatch) {
				existingSuggestionForQuery = suggestion
				continue
			}

			if (queryResult.isAtLeastPartialMatch) {
				validSuggestions.push(suggestion)
			}
		}

		validSuggestions.sort(Suggestion.compare)

		if (query.IsEmpty) {
			return validSuggestions
		}

		validSuggestions.unshift(this.suggestionSource.createSuggestionFromQuery(query, existingSuggestionForQuery))
		return validSuggestions
	}
}

export class NoteSuggestionCollector extends BaseSuggestionCollector<NoteSuggestion>{
	constructor(metadata: IMetadataCollection, settings: NoteAutoCreatorSettings) {
		super(new NoteSource(metadata, settings))
	}
}

export class FolderSuggestionCollector extends BaseSuggestionCollector<FolderSuggestion>{
	constructor(fileSystem: IFileSystem) {
		super(new FolderSource(fileSystem))
	}
}

export class NoteAndFolderSuggestionCollector extends BaseSuggestionCollector<ISuggestion>{
	constructor(interop: IObsidianInterop, settings: NoteAutoCreatorSettings) {
		super(new NoteAndFolderSource(interop, settings))
	}
}
