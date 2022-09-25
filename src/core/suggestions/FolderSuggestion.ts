import {ISuggestion} from "./ISuggestion"
import {ObsidianFolderPath} from "../paths/ObsidianFolderPath"
import {SuggestionRenderer} from "./SuggestionRenderer"
import {ObsidianPath} from "../paths/ObsidianPath"

export class FolderSuggestion implements ISuggestion{
	private readonly folderPath: ObsidianFolderPath

	constructor(folderPath: ObsidianFolderPath) {
		this.folderPath = folderPath
	}

	get Title(): string {
		return this.folderPath.Title
	}

	render(el: HTMLElement): void {
		SuggestionRenderer.RenderSuggestion(el, {
			content: `🗀 ${this.folderPath.Title}`,
			note: this.folderPath.VaultPath,
		})
	}

	get textToInsertOnLineUpdate(): string {
		return this.folderPath.VaultPath
	}

	get Path(): ObsidianPath {
		return this.folderPath
	}

	static FromPath(path: ObsidianFolderPath) {
		return new FolderSuggestion(path)
	}
}
