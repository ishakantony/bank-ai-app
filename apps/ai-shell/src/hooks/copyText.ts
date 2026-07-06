/**
 * Reduce an assistant reply's markdown to clean, readable plain text for the
 * clipboard — like copying a reply out of ChatGPT/Gemini rather than dumping
 * the raw source.
 *
 * A sibling of `speechText`, but tuned for *reading* rather than *speaking*: it
 * preserves structure (lists, tables, paragraph breaks, link URLs) instead of
 * flattening everything to prose. Custom `bank:<name>` blocks (chart/card/wizard/
 * suggestions JSON) are dropped entirely, `:hl[…]{tone=…}` highlights collapse to
 * their inner text, and the remaining markdown control syntax is stripped.
 */
export function copyText(content: string): string {
  const stripped = content
    // Custom component fences (charts, cards, wizard, suggestions) — dropped.
    .replace(/```bank:[\w-]+\n[\s\S]*?\n```/g, '')
    // Any other fenced code blocks — keep the inner code, drop the fences.
    .replace(/```[\w-]*\n?([\s\S]*?)\n?```/g, '$1')
    // Inline highlights → their inner text.
    .replace(/:hl\[([^\]]*)\]\{[^}]*\}/g, '$1')
    // Images → their alt text.
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    // Links → "text (url)", or just the url when text and url are identical.
    .replace(/\[([^\]]*)\]\(([^)]*)\)/g, (_m, text: string, url: string) =>
      text === url ? url : `${text} (${url})`,
    )
    // Task lists → ☑ / ☐ (keep leading indent for nesting).
    .replace(/^(\s*)[-*+]\s+\[[xX]\]\s+/gm, '$1☑ ')
    .replace(/^(\s*)[-*+]\s+\[ \]\s+/gm, '$1☐ ')
    // Bullets → • (keep leading indent). Must run before the emphasis strip so a
    // `* item` bullet's leading `*` isn't eaten as emphasis.
    .replace(/^(\s*)[-*+]\s+/gm, '$1• ')
    // Ordered list markers (1. 2. …) are already readable — leave them.
    // Headings → plain text lines.
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    // Blockquotes → plain text.
    .replace(/^\s*>\s?/gm, '')
    // Emphasis / inline-code / strikethrough markers.
    .replace(/(\*\*|__|~~|\*|_|`)/g, '')

  return formatTables(stripped)
    // Tidy whitespace: trim trailing spaces, collapse 3+ blank lines to one gap.
    .replace(/[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/** A markdown table separator row, e.g. `| --- | :--: |`. */
const SEPARATOR = /^\s*\|?[\s:|-]+\|?\s*$/

/** Split a table row on unescaped pipes, dropping the empty outer-pipe cells. */
function splitRow(line: string): string[] {
  const cells = line.split('|').map((c) => c.trim())
  if (cells.length && cells[0] === '') cells.shift()
  if (cells.length && cells[cells.length - 1] === '') cells.pop()
  return cells
}

/**
 * Reformat GFM tables into left-aligned, padded plain-text columns. Consecutive
 * pipe-containing lines that include a separator row become an aligned grid;
 * groups without a separator (incidental pipes) are left untouched.
 */
function formatTables(text: string): string {
  const lines = text.split('\n')
  const out: string[] = []
  let group: string[] = []

  const flush = () => {
    if (!group.length) return
    if (group.some((l) => SEPARATOR.test(l))) {
      const rows = group.filter((l) => !SEPARATOR.test(l)).map(splitRow)
      const widths: number[] = []
      for (const row of rows) {
        row.forEach((cell, i) => {
          widths[i] = Math.max(widths[i] ?? 0, cell.length)
        })
      }
      for (const row of rows) {
        out.push(
          row
            .map((cell, i) => (i < row.length - 1 ? cell.padEnd(widths[i]) : cell))
            .join('  ')
            .trimEnd(),
        )
      }
    } else {
      out.push(...group)
    }
    group = []
  }

  for (const line of lines) {
    if (line.includes('|')) {
      group.push(line)
    } else {
      flush()
      out.push(line)
    }
  }
  flush()
  return out.join('\n')
}
