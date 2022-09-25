import {ISuggestion} from "./ISuggestion"
import {ObsidianFolderPath} from "../paths/ObsidianFolderPath"
import {SuggestionRenderer} from "./SuggestionRenderer"
import {ObsidianPath} from "../paths/ObsidianPath"

export class FolderSuggestion implements ISuggestion{
	private static readonly FOLDER_ICON: string =
		'<svg viewBox="0 0 100 100" class="folder-icon" width="13" height="13"><path fill="currentColor" stroke="currentColor" d="M6.1,8c-3.3,0-6,2.7-6,6v73.8c-0.1,0.5-0.1,0.9,0.1,1.4c0.6,2.7,3,4.8,5.9,4.8h78c3,0,5.4-2.2,5.9-5.1 c0-0.1,0.1-0.2,0.1-0.4c0,0,0-0.1,0-0.1l0.1-0.3c0,0,0,0,0-0.1l9.9-53.6l0.1-0.2V34c0-3.3-2.7-6-6-6v-6c0-3.3-2.7-6-6-6H36.1 c0,0,0,0-0.1,0c-0.1,0-0.2-0.2-0.6-0.6c-0.5-0.6-1.1-1.5-1.7-2.5c-0.6-1-1.3-2.1-2.1-3C30.9,9,29.7,8,28.1,8L6.1,8z M6.1,12h22 c-0.1,0,0.1,0,0.6,0.6c0.5,0.6,1.1,1.5,1.7,2.5c0.6,1,1.3,2.1,2.1,3c0.8,0.9,1.9,1.9,3.6,1.9h52c1.1,0,2,0.9,2,2v6h-74 c-3.1,0-5.7,2.5-5.9,5.6h-0.1L10.1,34l-6,32.4V14C4.1,12.9,4.9,12,6.1,12z M16.1,32h78c1.1,0,2,0.9,2,2l-9.8,53.1l-0.1,0.1 c0,0.1,0,0.2-0.1,0.2c0,0.1,0,0.2-0.1,0.2c0,0,0,0.1,0,0.1c0,0,0,0,0,0.1c0,0.1,0,0.2-0.1,0.3c0,0.1,0,0.1,0,0.2 c0,0.1,0,0.2,0,0.2c-0.3,0.8-1,1.4-1.9,1.4h-78c-1.1,0-2-0.9-2-2L14,34.4l0.1-0.2V34C14.1,32.9,14.9,32,16.1,32L16.1,32z"></path></svg>'

	private readonly folderPath: ObsidianFolderPath

	constructor(folderPath: ObsidianFolderPath) {
		this.folderPath = folderPath
	}

	get Title(): string {
		return this.folderPath.Title
	}

	render(el: HTMLElement): void {
		SuggestionRenderer.RenderSuggestion(el, {
			content: `${this.folderPath.Title}`,
			note: this.folderPath.VaultPath,
			flair: {
				innerHTML: FolderSuggestion.FOLDER_ICON,
				label: "Folder"
			}
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
