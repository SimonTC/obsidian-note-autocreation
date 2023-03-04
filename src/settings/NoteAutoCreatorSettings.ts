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
	suggestLinksToNonExistingNotes: boolean
	relativeTopFolders: ObsidianFolderPath[]
	includeFoldersInSuggestions: boolean
	folderSuggestionSettings: FolderSuggestionSettings
	enableRelativePaths: boolean
	templateTriggerSymbol: string
	defaultTemplaterTemplate: string
	quickAddTriggerSymbol: string
	defaultQuickAddTemplate: string
}

export const DEFAULT_SETTINGS: NoteAutoCreatorSettings = {
	triggerSymbol: '@',
	suggestLinksToNonExistingNotes: true,
	relativeTopFolders: [],
	includeFoldersInSuggestions: false,
	folderSuggestionSettings: {folderSuggestionMode: FolderSuggestionMode.Always, folderSuggestionTrigger: '/'},
	enableRelativePaths: true,
	templateTriggerSymbol: '$',
	defaultTemplaterTemplate: '',
	quickAddTriggerSymbol: '€',
	defaultQuickAddTemplate: ''
}
