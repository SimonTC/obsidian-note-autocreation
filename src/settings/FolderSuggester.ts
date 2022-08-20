// Based on Liam's Periodic Notes Plugin: https://github.com/liamcain/obsidian-periodic-notes, but I have made some small changes.

import { TAbstractFile, TFolder } from "obsidian"
import { TextInputSuggest } from "./suggest"

export class FolderSuggest extends TextInputSuggest<TFolder> {
    getSuggestions(inputStr: string): TFolder[] {
        const abstractFiles = this.app.vault.getAllLoadedFiles()
        const folders: TFolder[] = []
        const lowerCaseInputStr = inputStr.toLowerCase()

        abstractFiles.forEach((folder: TAbstractFile) => {
            if (
                folder instanceof TFolder &&
                folder.path.toLowerCase().contains(lowerCaseInputStr)
            ) {
                folders.push(folder)
            }
        })

        return folders.sort((f1, f2) => f1.path.localeCompare(f2.path) )
    }

    renderSuggestion(file: TFolder, el: HTMLElement): void {
        el.setText(file.path)
    }

    selectSuggestion(file: TFolder): void {
        this.inputEl.value = file.path
        this.inputEl.trigger("input")
        this.close()
    }
}
