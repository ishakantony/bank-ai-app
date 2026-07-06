/**
 * Documentation metadata for the `/docs` gallery + playground, auto-aggregated
 * from each block folder. Two globs, two import graphs:
 *
 *   - `blocks/<name>/docs.ts`   → typed, machine-read metadata (this is `BlockDoc`)
 *   - `blocks/<name>/guide.md`  → optional long-form prose, rendered by `Markdown`
 *
 * The dependency direction is deliberately one-way: docs → blocks. Nothing in
 * the chat render path imports this file (the per-block `index.ts` never imports
 * its sibling `docs.ts`/`guide.md`), so example/prose strings never land in the
 * main bundle — only the lazily-loaded `/docs` route pulls them in.
 *
 * The gallery iterates the block *registry* (the source of truth for which
 * blocks exist) and looks each name up here, surfacing a "documentation pending"
 * placeholder for any registered block missing a `docs.ts`.
 *
 * Examples use Malaysian / MYR scenarios (RM, EPF/PRS/ASB, DuitNow) per the
 * project locale rules.
 *
 * `BlockDoc` lives in `@bank-poc/blocks-kit` (re-exported here for existing
 * importers) so block remotes can ship docs of the same shape.
 */
export type { BlockDoc } from '@bank-poc/blocks-kit'
import type { BlockDoc } from '@bank-poc/blocks-kit'

/** Folder-name → metadata, auto-discovered from `blocks/<name>/docs.ts`. */
const docMods = import.meta.glob<{ default: BlockDoc }>('../blocks/*/docs.ts', {
  eager: true,
})
export const blockDocs: Record<string, BlockDoc> = Object.fromEntries(
  Object.entries(docMods).map(([path, mod]) => [path.split('/')[2], mod.default]),
)

/**
 * Folder-name → raw long-form markdown, auto-discovered from
 * `blocks/<name>/guide.md`. Rendered through `Markdown`, so a guide can embed
 * live ```` ```bank:<name> ```` examples. Most blocks omit it.
 */
const guideMods = import.meta.glob('../blocks/*/guide.md', {
  eager: true,
  query: '?raw',
  import: 'default',
})
export const blockGuides: Record<string, string> = Object.fromEntries(
  Object.entries(guideMods).map(([path, mod]) => [path.split('/')[2], mod as string]),
)

/** Build the full ```bank:<name>``` fenced markdown for a block's example. */
export function blockFence(name: string, body: string): string {
  return '```bank:' + name + '\n' + body + '\n```'
}

/** Convenience: the fenced source for one example's data object. */
export function exampleFence(name: string, data: unknown): string {
  return blockFence(name, JSON.stringify(data, null, 2))
}
