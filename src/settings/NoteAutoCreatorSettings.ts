export interface NoteAutoCreatorSettings {
	triggerSymbol: string,
	templateTriggerSymbol: string
}

export const DEFAULT_SETTINGS: NoteAutoCreatorSettings = {
	triggerSymbol: '@',
	templateTriggerSymbol: '$'
}
