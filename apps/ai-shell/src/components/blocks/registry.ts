import { loadRemote, registerRemotes } from '@module-federation/runtime'
import type { BlockRemoteManifest } from '@bank-poc/shared'
import type { BlockDefinition, RemoteBlockModule } from './defineBlock'

export type { BlockDefinition }

/**
 * The block registry, auto-discovered from the per-block folders. Each
 * `blocks/<name>/index.ts` default-exports a `BlockDefinition` (its schema +
 * lazy component) via `defineBlock`; this glob wires them up keyed by folder
 * name — the same name used in a ```bank:<name>``` fence.
 *
 * Adding a *local* block is zero edits here: drop in a new folder and it
 * registers itself. Remote-hosted blocks are added at runtime by
 * `registerRemoteBlocks` from the backend manifest (see main.tsx).
 *
 * The eager glob pulls in every local block's (small) schema and builds its
 * `lazy()` wrapper, but does **not** execute the component loaders — so
 * component code (and Recharts) stays code-split out of the initial bundle.
 */
const mods = import.meta.glob<{ default: BlockDefinition }>('./*/index.ts', {
  eager: true,
})

export const blockRegistry: Record<string, BlockDefinition> = Object.fromEntries(
  Object.entries(mods)
    .map(([path, mod]) => [path.split('/')[1], mod.default] as const)
    .sort(([a], [b]) => a.localeCompare(b)),
)

/**
 * Register the block remotes described by the backend manifest. Each remote is
 * registered once with the Module Federation runtime, then every block name it
 * advertises becomes a `kind:'remote'` registry entry whose loader fetches the
 * exposed `{ schema, Component }` on first render via `loadRemote` (memoized, so
 * repeated renders share one in-flight/resolved module). Called once at boot;
 * safe to call again (idempotent per block name).
 */
export function registerRemoteBlocks(manifest: BlockRemoteManifest): void {
  for (const remote of manifest.remotes) {
    // `type: 'module'` — @module-federation/vite serves remoteEntry.js as an ES
    // module, so the runtime must import() it rather than load it as a global
    // script (the default), or it fails with runtime "Failed to get remoteEntry".
    registerRemotes([{ name: remote.name, entry: remote.entry, type: 'module' }])
    for (const block of remote.blocks) {
      let cached: Promise<RemoteBlockModule> | undefined
      blockRegistry[block] = {
        kind: 'remote',
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
