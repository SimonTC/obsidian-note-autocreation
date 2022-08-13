import {ObsidianFolderPath} from "../core/paths/ObsidianFolderPath"

export interface NoteAutoCreatorSettings {
	triggerSymbol: string,
	templateTriggerSymbol: string,
	suggestLinksToNonExistingNotes: boolean
	relativeTopFolders: ObsidianFolderPath[]
}

export const DEFAULT_SETTINGS: NoteAutoCreatorSettings = {
	triggerSymbol: '@',
	templateTriggerSymbol: '$',
	suggestLinksToNonExistingNotes: true,
	relativeTopFolders: []
}
