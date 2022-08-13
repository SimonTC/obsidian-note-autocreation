export interface NoteAutoCreatorSettings {
	triggerSymbol: string,
	templateTriggerSymbol: string,
	suggestLinksToNonExistingNotes: boolean
	relativeTopFolders: string[]
}

export const DEFAULT_SETTINGS: NoteAutoCreatorSettings = {
	triggerSymbol: '@',
	templateTriggerSymbol: '$',
	suggestLinksToNonExistingNotes: true,
	relativeTopFolders: []
}
