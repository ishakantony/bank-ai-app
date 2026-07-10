import type { ComponentType } from 'react'
import { loadRemote, registerRemotes } from '@module-federation/runtime'
import type { BlockRemoteManifest } from '@bank-poc/shared'

/**
 * A module loaded from a federated remote. Two flavors share this shape:
 *   - a data-driven block — exposes `{ schema, Component }`; the host validates
 *     incoming data against the remote-provided schema, then passes it as `data`.
 *   - a self-fetching widget — exposes just `{ Component }` and takes no props;
 *     the host merely mounts it and the remote owns its own data (see
 *     RemoteWidget / the promo-carousel remote).
 * Kept intentionally loose — validated at runtime, not via generated types.
 */
export interface RemoteBlockModule {
  schema?: { parse: (data: unknown) => unknown }
  Component: ComponentType<{ data?: unknown }>
}

interface RemoteBlockEntry {
  /** Memoized loader — repeated renders share one in-flight/resolved module. */
  load: () => Promise<RemoteBlockModule>
}

/**
 * Registry of remote blocks, populated at boot from the backend manifest.
 * Empty until (and unless) the manifest advertises remotes.
 */
export const blockRegistry: Record<string, RemoteBlockEntry> = {}

/**
 * Register the block remotes described by the backend manifest. Each remote is
 * registered once with the Module Federation runtime; every block name it
 * advertises becomes a registry entry whose loader fetches the exposed
 * `{ schema, Component }` on first use via `loadRemote` (memoized). Called once
 * at boot; a `{ remotes: [] }` manifest is a proven no-op — the point is that
 * the path is live so a future remote needs zero host changes.
 */
export function registerRemoteBlocks(manifest: BlockRemoteManifest): void {
  for (const remote of manifest.remotes) {
    // `type: 'module'` — @module-federation/vite serves remoteEntry.js as an ES
    // module, so the runtime must import() it rather than load it as a global
    // script (the default), or it fails with "Failed to get remoteEntry".
    registerRemotes([{ name: remote.name, entry: remote.entry, type: 'module' }])
    for (const block of remote.blocks) {
      let cached: Promise<RemoteBlockModule> | undefined
      blockRegistry[block] = {
        load: () =>
          (cached ??= loadRemote<{ default: RemoteBlockModule }>(
            `${remote.name}/${block}`,
          ).then((mod) => {
            if (!mod?.default) {
              throw new Error(`remote block "${block}" has no default export`)
            }
            return mod.default
          })),
      }
    }
  }
}

/**
 * Fire-and-forget: start loading the named blocks' remote chunks now, so they're
 * warm (in the MF module cache + browser HTTP cache) by the time something
 * renders them. Calls each block's already-memoized `load()` — so this shares
 * the very same `@module-federation/runtime` `loadRemote` cache a later
 * `RemoteAiCard`/`RemoteWidget` hits, warming across the module-federation seam
 * with no second network fetch. Errors are swallowed: warming must never break
 * boot, and the real render still fails gracefully on its own. Unknown block
 * names are simply skipped.
 */
export function prefetchBlocks(names: string[]): void {
  for (const name of names) {
    blockRegistry[name]?.load().catch(() => {})
  }
}
