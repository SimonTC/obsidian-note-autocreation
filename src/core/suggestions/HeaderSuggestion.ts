import {FileSuggestion} from "./FileSuggestion"
import {ObsidianFilePath} from "../ObsidianFilePath"

export class HeaderSuggestion implements FileSuggestion{
	readonly Path: ObsidianFilePath
	readonly Trigger: string

	get FolderPath(): string {
		return ""
	}

	get NoteIsInRoot(): boolean {
		return false
	}

	get Title(): string {
		return ""
	}

	get VaultPath(): string {
		return ""
	}

	get VaultPathWithoutExtension(): string {
		return ""
	}

	render(el: HTMLElement): void {
	}

	get textToInsertOnLineUpdate(): string {
		return ""
	}
}
