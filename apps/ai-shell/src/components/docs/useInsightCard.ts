import { useEffect, useState } from 'react'
import { loadRemote, registerRemotes } from '@module-federation/runtime'
import type { BlockDoc } from '@bank-poc/blocks-kit'
import type { RemoteBlockModule } from '../blocks/defineBlock'

/**
 * Entry URL of the `mobileAiInsight` block remote, env-overridable (mirrors the
 * server's `BLOCKS_SPEND_ENTRY` convention). Points at the local dev remote by
 * default — start it with `npm run remote:mobile-ai` (or `npm run dev:docs`).
 */
const INSIGHT_ENTRY =
  import.meta.env.VITE_MOBILE_AI_INSIGHT_ENTRY ??
  'http://localhost:9994/remoteEntry.js'

/** MF runtime name of the remote and its exposed module ids. */
const REMOTE = 'mobileAiInsight'

/**
 * The bento playground loads the insight-card remote directly, in isolation
 * from the shared block registry (this card is a sized mobile bento card, not a
 * chat reply block, and renders at 0-height without a sized parent — so it must
 * not appear in the Custom Blocks gallery or work in chat fences).
 */
export type InsightCardState =
  | { status: 'loading' }
  | { status: 'error' }
  | {
      status: 'ready'
      module: RemoteBlockModule
      /** Docs from the remote's `./docs` expose; `null` if it didn't load. */
      docs: BlockDoc | null
    }

// Guard against re-registering the remote across mounts (registerRemotes is
// idempotent by name, but registering once is cleaner).
let registered = false

/**
 * Register the `mobileAiInsight` remote and load its `insightCard`
 * `{ schema, Component }` plus (optionally) its `./docs` metadata at runtime,
 * reusing the MF runtime the host already initializes at boot. Degrades to
 * `status: 'error'` when the remote is unreachable (e.g. `:9994` is down) so the
 * tab can show a friendly "start the remote" notice instead of crashing.
 */
export function useInsightCard(): InsightCardState {
  const [state, setState] = useState<InsightCardState>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        if (!registered) {
          // `type: 'module'` — @module-federation/vite serves remoteEntry.js as
          // an ES module, so the runtime must import() it (same gotcha as the
          // shared block remotes).
          registerRemotes([{ name: REMOTE, entry: INSIGHT_ENTRY, type: 'module' }])
          registered = true
        }
        const [card, docsMod] = await Promise.all([
          loadRemote<{ default: RemoteBlockModule }>(`${REMOTE}/insightCard`),
          // Docs are optional — degrade gracefully if the expose is missing.
          loadRemote<{ default: Record<string, BlockDoc> }>(
            `${REMOTE}/docs`,
          ).catch(() => null),
        ])
        if (!card?.default) throw new Error('insightCard has no default export')
        if (cancelled) return
        setState({
          status: 'ready',
          module: card.default,
          docs: docsMod?.default?.insightCard ?? null,
        })
      } catch {
        if (!cancelled) setState({ status: 'error' })
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return state
}
