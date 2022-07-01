export interface NoteAutoCreatorSettings {
	triggerSymbol: string,
	templateTriggerSymbol: string,
	suggestLinksToNonExistingNotes: boolean
}

export const DEFAULT_SETTINGS: NoteAutoCreatorSettings = {
	triggerSymbol: '@',
	templateTriggerSymbol: '$',
	suggestLinksToNonExistingNotes: true
}
