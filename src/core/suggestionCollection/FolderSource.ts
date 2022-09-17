import {IFileSystem} from "../../interop/ObsidianInterfaces"
import {FolderSuggestion} from "../suggestions/FolderSuggestion"
import {FolderQuery} from "../queries/FolderQuery"
import {ObsidianFolderPath} from "../paths/ObsidianFolderPath"
import {ISuggestionSource} from "./ISuggestionSource"

export class FolderSource implements ISuggestionSource<FolderSuggestion>{
	private readonly fileSystem: IFileSystem

	constructor(fileSystem: IFileSystem) {
		this.fileSystem = fileSystem
	}

	createSuggestionFromQuery(query: FolderQuery, existingSuggestionForQuery: FolderSuggestion): FolderSuggestion{
		return existingSuggestionForQuery
			? existingSuggestionForQuery
			: new FolderSuggestion(new ObsidianFolderPath(query.query))
	}

	getAllPossibleSuggestions(query: string): FolderSuggestion[]{
		return this.fileSystem.getPathsToAllLoadedFolders().map(FolderSuggestion.FromPath)
	}
}
