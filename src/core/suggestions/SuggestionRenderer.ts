export type FlairParams = {
	text?: string,
	label?: string
	innerHTML?: string
}
export type RenderingParams = {
	content: string
	note: string
	flair?: FlairParams
}

export class SuggestionRenderer {

	/**
	 * Renders the suggestion in Obsidian.
	 * @param el - The parent suggestion element
	 * @param params - the parameters used for rendering
	 */
	static RenderSuggestion(el: HTMLElement, params: RenderingParams){
		el.addClass("mod-complex") // Needed to make everything look good

		const content = el.createDiv({
			cls: "suggestion-content",
		})

		content.createDiv({
			cls: "suggestion-title",
			text: params.content
		})

		content.createDiv({
			cls: "suggestion-note",
			text: params.note
		})

		if (params.flair){
			const aux = el.createDiv({
				cls: "suggestion-aux"
			})

			const flair =
				aux.createSpan({
					cls: "suggestion-flair",
					text: params.flair.text
				})

			flair.ariaLabel = params.flair.label ?? flair.ariaLabel
			flair.innerHTML = params.flair.innerHTML ?? flair.innerHTML
		}
	}
}
