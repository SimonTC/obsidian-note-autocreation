import {IFileSystem} from "../../interop/ObsidianInterfaces"
import {FolderSuggestion} from "../suggestions/FolderSuggestion"
import {Query} from "../queries/FileQuery"

export class FolderSuggestionCollector {
	private readonly fileSystem: IFileSystem

	constructor(fileSystem: IFileSystem) {
		this.fileSystem = fileSystem
	}

	getSuggestions(queryString: string): FolderSuggestion []{
		const query = Query.forFolderSuggestions(queryString)
	}
}
