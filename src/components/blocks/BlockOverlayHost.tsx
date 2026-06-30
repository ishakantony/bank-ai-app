import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { useBlockBus, type BlockEntry } from '../../store/blockBus'

/**
 * Maps a registered block's `type` to the overlay it renders. Lazy so heavy
 * overlay deps (Radix Dialog, etc.) stay out of the initial bundle and load
 * only when an overlay first opens. Adding an overlay-bearing block = one line.
 */
const OVERLAYS = {
  wizard: lazy(() => import('./wizard/WizardDrawer')),
} satisfies Record<BlockEntry['type'], unknown>

interface OpenOverlay {
  id: string
  payload?: unknown
}

/**
 * Mounted once on the chat screen. Watches block-bus signals and turns an
 * `open` intent aimed at a registered block into its overlay — letting one
 * block (e.g. a "Reassess" suggestion pill) open another (the wizard drawer)
 * across messages, without either knowing about the other.
 */
export function BlockOverlayHost() {
  const signals = useBlockBus((s) => s.signals)
  const registry = useBlockBus((s) => s.registry)
  const [open, setOpen] = useState<OpenOverlay | null>(null)
  // Track the last signal counter seen per id so each intent fires once. Seed it
  // from the signals already present at mount so they read as consumed: signals
  // outlive a route change, and only intents fired *while mounted* should open
  // an overlay (otherwise leaving and re-entering the thread replays a stale one).
  const seen = useRef<Record<string, number> | null>(null)
  if (seen.current === null) {
    seen.current = Object.fromEntries(
      Object.entries(useBlockBus.getState().signals).map(([id, s]) => [id, s.n]),
    )
  }

  useEffect(() => {
    const seenMap = (seen.current ??= {})
    for (const [id, sig] of Object.entries(signals)) {
      if (sig.n <= (seenMap[id] ?? 0)) continue
      seenMap[id] = sig.n
      if (sig.name === 'open') setOpen({ id, payload: sig.payload })
      else if (sig.name === 'close') {
        setOpen((cur) => (cur?.id === id ? null : cur))
      }
    }
  }, [signals])

  if (!open) return null
  const entry = registry[open.id]
  if (!entry) return null

  const Overlay = OVERLAYS[entry.type]
  return (
    <Suspense fallback={null}>
      <Overlay
        id={open.id}
        entry={entry}
        payload={open.payload}
        onClose={() => setOpen(null)}
      />
    </Suspense>
  )
}
