import {TextInputSuggest} from "./suggest"
import {App, TFile} from "obsidian"
import {IFileSystem} from "../interop/ObsidianInterfaces"

export class FileSuggester extends TextInputSuggest<TFile>{

	private readonly rootFolderPath: string
	private readonly fileSystem: IFileSystem

	constructor(app: App, inputEl: HTMLInputElement | HTMLTextAreaElement, rootFolderPath: string, fileSystem: IFileSystem) {
		super(app, inputEl)
		this.fileSystem = fileSystem
		this.rootFolderPath = rootFolderPath ?? '/'
	}

	getSuggestions(inputStr: string): TFile[] {
		const files = this.fileSystem.getAllFileDescendantsOf(this.rootFolderPath)
		const lowerCaseInputStr = inputStr.toLowerCase()
		const suggestedFiles: TFile[] = []
		for(const file of files){
			const lowerCasePath = file.path.toLowerCase()
			const queryCouldBeForThisFile = () => lowerCasePath.contains(lowerCaseInputStr)
			if (queryCouldBeForThisFile()){
				suggestedFiles.push(file)
			}
		}
		return suggestedFiles.sort((f1, f2) => f1.path.localeCompare(f2.path) )
	}

	renderSuggestion(file: TFile, el: HTMLElement): void {
		el.setText(file.path)
	}

	selectSuggestion(file: TFile): void {
		this.inputEl.value = file.path
		this.inputEl.trigger("input")
		this.close()
	}
}
