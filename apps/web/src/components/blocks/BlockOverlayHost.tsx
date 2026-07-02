import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { useBlockBus } from '@bank-ai/blocks-runtime'

interface OpenOverlay {
  id: string
  payload?: unknown
}

/**
 * Mounted once on the chat screen. Watches block-bus signals and turns an
 * `open` intent aimed at a registered block into its overlay — letting one
 * block (e.g. a "Reassess" suggestion pill) open another (the wizard drawer)
 * across messages, without either knowing about the other.
 *
 * The overlay component travels with the block: each registered entry carries a
 * `loadOverlay` loader, so the drawer for a *federated* block is fetched from
 * that remote on first open. This host stays generic — it never imports a
 * specific overlay (heavy deps like Radix Dialog load only when one opens).
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

  const entry = open ? registry[open.id] : undefined
  // Memoize the lazy overlay per entry so re-renders don't remount it mid-use.
  const Overlay = useMemo(
    () => (entry ? lazy(entry.loadOverlay) : null),
    [entry],
  )

  if (!open || !entry || !Overlay) return null
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
