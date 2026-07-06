import { blockRegistry } from './registry'

/** Matches a ```bank:<name>``` fence and captures its name + raw JSON body. */
const FENCE = /```bank:([\w-]+)\n([\s\S]*?)\n```/g

/**
 * Replace every ```bank:<name>``` fence in a reply with a plain-text
 * serialization of the block, for copying to the clipboard. Each block's
 * `toText` owns how its data reads as prose (charts → a one-line summary,
 * cards/tables → labelled lines); a block with no `toText`, or any
 * parse/validate/serialize failure, collapses to nothing — matching the
 * "keep block JSON off the clipboard" default.
 *
 * Remote blocks load their `{ schema, toText }` on demand (memoized by the
 * registry), so this is async; callers `await` it before running `copyText`.
 */
export async function expandBlocksToText(content: string): Promise<string> {
  const matches = [...content.matchAll(FENCE)]
  if (!matches.length) return content

  const replacements = await Promise.all(
    matches.map(([, name, raw]) => serializeBlock(name, raw)),
  )

  // Global replace visits matches in the same order as matchAll, so the
  // pre-resolved replacements line up by index. A function replacer avoids
  // `$`-substitution surprises in serialized text.
  let i = 0
  return content.replace(FENCE, () => replacements[i++])
}

async function serializeBlock(name: string, raw: string): Promise<string> {
  const entry = blockRegistry[name]
  if (!entry) return ''

  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch {
    return ''
  }

  try {
    const mod = entry.kind === 'local' ? entry : await entry.load()
    if (!mod.toText) return ''
    const parsed = mod.schema.safeParse(data)
    if (!parsed.success) return ''
    return mod.toText(parsed.data) || ''
  } catch {
    return ''
  }
}
