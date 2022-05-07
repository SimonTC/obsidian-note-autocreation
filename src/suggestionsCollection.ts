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
