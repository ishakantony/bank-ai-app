import { useEffect, useState } from 'react'
import { loadRemote } from '@module-federation/runtime'
import type { BlockDoc } from '@bank-ai/blocks-kit'
import { fetchBlockRemotes } from '../../api/blockRemotes'
import { blockDocs } from './blockDocs'

/**
 * Local block docs (the `blocks/<name>/docs.ts` glob) merged with docs loaded
 * from each block remote at runtime. A remote exposes a `./docs` module whose
 * default export is a `Record<blockName, BlockDoc>`; we load it lazily on the
 * `/docs` route (the remotes are already registered at boot) so remote-hosted
 * blocks show full documentation instead of the "documentation pending"
 * placeholder. Local docs win on key collisions; failures degrade to local-only.
 */
export function useBlockDocs(): Record<string, BlockDoc> {
  const [remote, setRemote] = useState<Record<string, BlockDoc>>({})

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const manifest = await fetchBlockRemotes()
        const merged: Record<string, BlockDoc> = {}
        await Promise.all(
          manifest.remotes.map(async (r) => {
            try {
              const mod = await loadRemote<{ default: Record<string, BlockDoc> }>(
                `${r.name}/docs`,
              )
              if (mod?.default) Object.assign(merged, mod.default)
            } catch {
              // A remote may not expose ./docs — skip it.
            }
          }),
        )
        if (!cancelled && Object.keys(merged).length) setRemote(merged)
      } catch {
        // No manifest — fall back to local docs only.
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return { ...remote, ...blockDocs }
}
