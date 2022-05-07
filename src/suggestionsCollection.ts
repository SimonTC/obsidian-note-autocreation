export class Suggestion{

	readonly VaultPath: string;
	readonly Title: string;
	readonly FolderPath: string

	constructor(vaultPath: string) {
		this.VaultPath = vaultPath;
		this.Title = this.extractTitle(vaultPath);
		this.FolderPath = this.extractFolderPath(vaultPath);
	}

	private extractFolderPath(vaultPath: string): string {
		const fileNameStartsAt = vaultPath.lastIndexOf('/')
		return fileNameStartsAt === -1
			? undefined
			: vaultPath.slice(0, fileNameStartsAt);
	}

	private extractTitle(vaultPath: string): string{
		const fileNameWithPossibleExtension = vaultPath.split('/').pop();
		const extensionStartsAt = fileNameWithPossibleExtension.lastIndexOf('.')

		return extensionStartsAt === -1
			? fileNameWithPossibleExtension
			: fileNameWithPossibleExtension.slice(0, extensionStartsAt);
	}
}

export type DocumentLocation = {
	line: number,
	ch: number
}

export type SuggestionTrigger = {
	start: DocumentLocation,
	end: DocumentLocation,
	query: string
}

const regex = new RegExp(/(?:^| )@(?!.*]])(.*)/, "d"); // d flag is necessary to get the indices of the groups

export function extractSuggestionTrigger(lineText: string, cursorPosition: DocumentLocation): SuggestionTrigger {
	const triggerSymbolIndex = lineText.indexOf('@')
	if (lineText.length === 0 || cursorPosition.ch === 0 || triggerSymbolIndex == -1){
		return null;
	}

	const textToSearch = lineText.slice(0, cursorPosition.ch)
	const match = regex.exec(textToSearch)

	if (!match){
		return null;
	}

	const myMatch: any = match; // Need to convert to any to get access to the indices somewhat easily
	const query = match[1] // Contains the text of the first found group
	const groupIndices = myMatch.indices
	const queryStartIndex = Number(groupIndices[1][0])
	const queryEndIndex = Number(groupIndices[1][1])

	return {
		start: { line: cursorPosition.line, ch: queryStartIndex },
		end: { line: cursorPosition.line, ch: queryEndIndex  },
		query: query
	}
}

export class SuggestionCollector{
	private metadata: IMetadataCollection;

	constructor(metadata: IMetadataCollection) {
		this.metadata = metadata;
	}

	getSuggestions(): Suggestion[] {
		const allLinks = [...new Set(this.getVaultPathsOfAllLinks())];
		return allLinks.map(path => new Suggestion(path)).sort((a,b) =>  a.Title.localeCompare(b.Title))
	}

	private *getVaultPathsOfAllLinks(){
		const unresolvedLinks: Record<string, Record<string, number>> = this.metadata.getUnresolvedLinks();
		for (let pathToFileWithPossibleUnresolvedLink in unresolvedLinks) {
			yield pathToFileWithPossibleUnresolvedLink;

			for (let unresolvedLink in unresolvedLinks[pathToFileWithPossibleUnresolvedLink]) {
				yield unresolvedLink;
			}
		}
	}
}

/**
 * Interface for accessing metadata from Obsidian
 */
export interface IMetadataCollection{
	getUnresolvedLinks():  Record<string, Record<string, number>>
}
