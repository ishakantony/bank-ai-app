import { loadRemote, registerRemotes } from '@module-federation/runtime'
import type { BlockRemoteManifest } from '@bank-ai/shared'

/**
 * A block loaded from a federated remote. The shell renders none of these yet —
 * this is the host-ready wiring so a remote MFE can be dropped in later with no
 * build change. Each remote exposes `<name>` as a `{ schema, Component }` pair;
 * the host would Zod-validate incoming data against the remote-provided schema
 * before rendering (no compile-time dependency on the remote's data shape).
 */
export interface RemoteBlockModule {
  // Kept intentionally loose — validated at runtime, not via generated types.
  schema: { parse: (data: unknown) => unknown }
  Component: (props: { data: unknown }) => unknown
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
