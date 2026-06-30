/**
 * Reduce an assistant reply's markdown to plain prose suitable for text-to-speech.
 *
 * Custom `bank:<name>` blocks (chart/card/wizard/suggestions JSON) are dropped
 * entirely — their bodies would be read aloud as gibberish — `:hl[…]{tone=…}`
 * highlights collapse to their inner text, and the remaining markdown syntax is
 * stripped so the synthesizer speaks natural sentences rather than punctuation.
 */
export function speechText(content: string): string {
  return (
    content
      // Custom component fences (charts, cards, wizard, suggestions).
      .replace(/```bank:[\w-]+\n[\s\S]*?\n```/g, '')
      // Any other fenced code blocks.
      .replace(/```[\s\S]*?```/g, '')
      // Inline highlights → their inner text.
      .replace(/:hl\[([^\]]*)\]\{[^}]*\}/g, '$1')
      // Images, then links → their text.
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      // Table separator rows (|---|:--:|).
      .replace(/^\s*\|?[\s:|-]+\|?\s*$/gm, '')
      // Table border pipes, then internal cell pipes → comma pauses.
      .replace(/^\s*\|/gm, '')
      .replace(/\|\s*$/gm, '')
      .replace(/\s*\|\s*/g, ', ')
      // Task-list / bullet / ordered-list markers.
      .replace(/^\s*[-*+]\s+\[[ xX]\]\s+/gm, '')
      .replace(/^\s*[-*+]\s+/gm, '')
      .replace(/^\s*\d+\.\s+/gm, '')
      // Headings and blockquotes.
      .replace(/^\s{0,3}#{1,6}\s+/gm, '')
      .replace(/^\s*>\s?/gm, '')
      // Emphasis / inline-code / strikethrough markers.
      .replace(/(\*\*|__|~~|\*|_|`)/g, '')
      // Tidy whitespace.
      .replace(/[ \t]{2,}/g, ' ')
      .replace(/\n{2,}/g, '\n')
      .trim()
  )
}
