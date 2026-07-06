import { Component, Suspense, use, type ReactNode } from 'react'
import { blockRegistry, type RemoteBlockModule } from '../blocks/registry'

/**
 * Silently swallows a failed remote load/render. A missing or broken remote
 * widget should degrade the shell gracefully (render the fallback, or nothing),
 * never crash the page.
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
      console.warn('[remote-widget] render error', error)
    }
  }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children
  }
}

/** Suspends on the (memoized) remote load, then mounts `<Component />` — no props. */
function Widget({ load }: { load: () => Promise<RemoteBlockModule> }) {
  const mod = use(load())
  const Mounted = mod.Component
  return <Mounted />
}

/**
 * Mounts a self-fetching federated widget by registered name. The shell knows
 * nothing about the widget's data or props — it just resolves the loader from
 * the block registry (populated at boot from the backend manifest) and renders
 * the exposed component. If the remote isn't registered, fails to load, or
 * throws while rendering, the `fallback` is shown instead (nothing by default).
 */
export function RemoteWidget({
  name,
  fallback = null,
}: {
  name: string
  fallback?: ReactNode
}) {
  const entry = blockRegistry[name]
  if (!entry) return <>{fallback}</>

  return (
    <SilentBoundary fallback={fallback}>
      <Suspense fallback={null}>
        <Widget load={entry.load} />
      </Suspense>
    </SilentBoundary>
  )
}
