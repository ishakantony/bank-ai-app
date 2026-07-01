/** Matches a ```bank:suggestions``` fence and captures its JSON body. */
const SUGGESTIONS_FENCE = /```bank:suggestions\s*\n([\s\S]*?)\n?```/

/**
 * Separate an assistant reply into prose and its (optional) suggestions block.
 * The `suggestions` block renders below the message actions rather than inline,
 * so we strip its fence from `prose` (which feeds the typewriter + markdown) and
 * hand back the captured JSON body as `raw` for `CustomBlock` to render.
 */
export function splitSuggestions(content: string): {
  prose: string
  raw: string | null
} {
  const match = SUGGESTIONS_FENCE.exec(content)
  if (!match) return { prose: content, raw: null }
  const prose = content.replace(match[0], '').trimEnd()
  return { prose, raw: match[1] }
}
