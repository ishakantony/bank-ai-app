import { Component, Suspense, use, type ReactNode } from 'react'
import { loadRemote, registerRemotes } from '@module-federation/runtime'

/**
 * Generic delegation glue: renders a Team-B-owned AI card, loaded at runtime by
 * Module Federation, given only a logical block id + opaque data from the feed.
 *
 * This is written ONCE and is block-agnostic — it never changes when Team B adds
 * a new AI card. The carousel keeps owning the carousel; this file owns nothing
 * about AI beyond "resolve a block id → a remote module, validate, render".
 *
 * Mirrors the AI shell's `CustomBlock`/`RemoteBlock` resolve+load+validate flow,
 * but self-contained: it resolves the remote from `/api/block-remotes` itself
 * (never importing shell code — correct dependency direction), so the feed stays
 * Module-Federation-agnostic (it names a block, never a remote).
 */

/** A remote AI card module: `{ schema, Component }`, validated at runtime. */
interface RemoteCardModule {
  schema: { safeParse: (data: unknown) => { success: boolean; data?: unknown } }
  Component: (props: { data: unknown }) => ReactNode
}

interface Manifest {
  remotes: { name: string; entry: string; blocks: string[] }[]
}

/**
 * Resolve block id → remote module, memoized per block id. Fetches the manifest
 * once (shared across all cards), registers each remote with the MF runtime
 * (idempotent), then `loadRemote`s the block the first time it's asked for. The
 * shell already registers these remotes at boot; we register again defensively
 * so the carousel works even if mounted before/without the shell's boot step.
 */
let manifestPromise: Promise<Manifest> | null = null
const registered = new Set<string>()
const moduleCache = new Map<string, Promise<RemoteCardModule>>()

function fetchManifest(): Promise<Manifest> {
  return (manifestPromise ??= fetch('/api/block-remotes').then((res) => {
    if (!res.ok) throw new Error(`Failed to load block remotes (${res.status})`)
    return res.json() as Promise<Manifest>
  }))
}

function loadCard(block: string): Promise<RemoteCardModule> {
  const cached = moduleCache.get(block)
  if (cached) return cached

  const promise = fetchManifest().then(async (manifest) => {
    const remote = manifest.remotes.find((r) => r.blocks.includes(block))
    if (!remote) throw new Error(`no remote advertises block "${block}"`)
    if (!registered.has(remote.name)) {
      // `type: 'module'` — @module-federation/vite serves remoteEntry.js as an
      // ES module, so the runtime must import() it, not load it as a global.
      registerRemotes([
        { name: remote.name, entry: remote.entry, type: 'module' },
      ])
      registered.add(remote.name)
    }
    const mod = await loadRemote<{ default: RemoteCardModule }>(
      `${remote.name}/${block}`,
    )
    if (!mod?.default) {
      throw new Error(`remote block "${block}" has no default export`)
    }
    return mod.default
  })
  moduleCache.set(block, promise)
  return promise
}

/**
 * Silently swallows a failed remote load/render, showing `fallback` instead — so
 * a missing/broken AI remote degrades to the plain insight (or nothing), never
 * crashes the carousel. Mirrors the shell's boot silent-fail behavior.
 */
class SilentBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(error: unknown) {
    if (import.meta.env.DEV) {
      console.warn('[remote-ai-card] load/render error', error)
    }
  }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children
  }
}

/** Suspends on the (memoized) load, validates `data`, then renders the card. */
function Card({
  block,
  data,
  fallback,
}: {
  block: string
  data: unknown
  fallback: ReactNode
}) {
  const mod = use(loadCard(block))
  const parsed = mod.schema.safeParse(data)
  if (!parsed.success) {
    if (import.meta.env.DEV) {
      console.warn(`[remote-ai-card] data failed validation for "${block}"`)
    }
    return <>{fallback}</>
  }
  const Mounted = mod.Component
  return <Mounted data={parsed.data} />
}

/**
 * Renders an AI card delegated to a Team B remote. Resolves `block` → remote via
 * the manifest, loads it, Zod-validates `data`, and renders — falling back to
 * `fallback` on any failure (unresolvable block, load error, schema mismatch,
 * render throw). Block-agnostic: adding new AI cards never edits this file.
 */
export function RemoteAiCard({
  block,
  data,
  fallback = null,
}: {
  block: string
  data: unknown
  fallback?: ReactNode
}) {
  return (
    <SilentBoundary fallback={fallback}>
      {/* Same `fallback` covers the (common) loading case, not just errors — so
          the slot shows the caller's placeholder while the remote loads instead
          of flashing blank and shifting layout when the card arrives. */}
      <Suspense fallback={fallback}>
        <Card block={block} data={data} fallback={fallback} />
      </Suspense>
    </SilentBoundary>
  )
}
