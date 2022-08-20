// Based on Liam's Periodic Notes Plugin: https://github.com/liamcain/obsidian-periodic-notes, but I have made some small changes.

import { TAbstractFile, TFolder } from "obsidian"
import { TextInputSuggest } from "./suggest"

export class FolderSuggest extends TextInputSuggest<TFolder> {
    getSuggestions(inputStr: string): TFolder[] {
        const abstractFiles = this.app.vault.getAllLoadedFiles()
        const folders: TFolder[] = []
        const lowerCaseInputStr = inputStr.toLowerCase()

        abstractFiles.forEach((folder: TAbstractFile) => {
			if (folder instanceof TFolder) {
				const lowerCaseFolderPath = folder.path.toLowerCase()
				const queryCouldBeForThisFolder = () => lowerCaseFolderPath.contains(lowerCaseInputStr)
				const queryIsAlsoForThisFolder = () => lowerCaseInputStr.endsWith('/') && `${lowerCaseFolderPath}/` === lowerCaseInputStr // Obsidian paths do not include '/' as the last symbol. We make this check to make sure that a query ending in '/' doesn't exclude the folder that would match that.
				if (queryCouldBeForThisFolder() || queryIsAlsoForThisFolder()){
					folders.push(folder)
				}
			}
        })

        return folders.sort((f1, f2) => f1.path.localeCompare(f2.path) )
    }

    renderSuggestion(folder: TFolder, el: HTMLElement): void {
        const folderPath = folder.path
		const pathToShow = this.addFinalFolderDelimiterToFolderNameIfNecessary(folderPath)
		el.setText(pathToShow)
    }

	private addFinalFolderDelimiterToFolderNameIfNecessary(folderPath: string) {
		return folderPath.endsWith('/')
			? folderPath
			: `${folderPath}/`
	}

	selectSuggestion(folder: TFolder): void {
		const folderPath = folder.path
		const pathToUse = this.addFinalFolderDelimiterToFolderNameIfNecessary(folderPath)
        this.inputEl.value = pathToUse
        this.inputEl.trigger("input")
        this.close()
    }
}
