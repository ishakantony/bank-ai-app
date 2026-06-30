import type { BlockDefinition } from './defineBlock'

export type { BlockDefinition }

/**
 * The block registry, auto-discovered from the per-block folders. Each
 * `blocks/<name>/index.ts` default-exports a `BlockDefinition` (its schema +
 * lazy component) via `defineBlock`; this glob wires them up keyed by folder
 * name — the same name used in a ```bank:<name>``` fence.
 *
 * Adding a block is therefore *zero edits here*: drop in a new folder and it
 * registers itself. The eager glob pulls in every block's (small) schema and
 * builds its `lazy()` wrapper, but does **not** execute the component loaders —
 * so component code (and Recharts) stays code-split out of the initial bundle.
 *
 * `index.ts` deliberately never imports its sibling `docs.ts` / `guide.md`, so
 * documentation prose stays out of this (chat) import graph entirely.
 */
const mods = import.meta.glob<{ default: BlockDefinition }>('./*/index.ts', {
  eager: true,
})

export const blockRegistry: Record<string, BlockDefinition> = Object.fromEntries(
  Object.entries(mods)
    .map(([path, mod]) => [path.split('/')[1], mod.default] as const)
    .sort(([a], [b]) => a.localeCompare(b)),
)
