import {ObsidianFolderPath} from "../core/paths/ObsidianFolderPath"

export enum FolderSuggestionMode{
	Always= "always",
	OnTrigger = "on-trigger"
}

export interface FolderSuggestionSettings {
	folderSuggestionMode: FolderSuggestionMode,
	folderSuggestionTrigger: string
}

export interface NoteAutoCreatorSettings {
	triggerSymbol: string,
	templateTriggerSymbol: string,
	suggestLinksToNonExistingNotes: boolean
	relativeTopFolders: ObsidianFolderPath[]
	includeFoldersInSuggestions: boolean
	folderSuggestionSettings: FolderSuggestionSettings
}

export const DEFAULT_SETTINGS: NoteAutoCreatorSettings = {
	triggerSymbol: '@',
	templateTriggerSymbol: '$',
	suggestLinksToNonExistingNotes: true,
	relativeTopFolders: [],
	includeFoldersInSuggestions: false,
	folderSuggestionSettings: {folderSuggestionMode: FolderSuggestionMode.Always, folderSuggestionTrigger: '/'}
}
