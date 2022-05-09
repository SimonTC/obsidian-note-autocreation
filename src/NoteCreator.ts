import {Suggestion} from "./Suggestion";

export type NoteCreationCommand = {
	FileCreationNeeded: boolean
}

export class NoteCreator{
	prepareNoteCreationFor(suggestion: Suggestion): NoteCreationCommand{
		return {FileCreationNeeded: false}
	}
}
