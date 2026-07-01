import { Suspense, use } from 'react'
import { BlockFallback, ComponentSkeleton } from '@bank-ai/blocks-kit'
import { blockRegistry } from './registry'
import type { RemoteBlockModule } from './defineBlock'
import { BlockErrorBoundary } from './BlockErrorBoundary'

interface CustomBlockProps {
  /** The component key from a ```bank:<name>``` fence. */
  name: string
  /** The raw JSON body of the fence. */
  raw: string
}

function warn(message: string, detail?: unknown) {
  if (import.meta.env.DEV) {
    console.warn(`[block] ${message}`, detail ?? '')
  }
}

/**
 * A remote-hosted block: its schema + component arrive together when the remote
 * chunk loads, so we suspend on the (memoized) load, then validate the parsed
 * data against the loaded schema and render — degrading to the fallback on a
 * schema mismatch. A load failure throws and is caught by the error boundary.
 */
function RemoteBlock({
  name,
  load,
  data,
}: {
  name: string
  load: () => Promise<RemoteBlockModule>
  data: unknown
}) {
  const mod = use(load())
  const parsed = mod.schema.safeParse(data)
  if (!parsed.success) {
    warn(`data failed validation for block "${name}"`, parsed.error.issues)
    return <BlockFallback />
  }
  const Component = mod.Component
  return <Component data={parsed.data} />
}

/**
 * Renders one custom block from an assistant message. Resolves the name in the
 * registry, parses the JSON, then renders the block — a local block validates
 * up front against its compiled-in schema; a remote block loads its
 * `{ schema, Component }` and validates after. Everything renders inside a
 * Suspense + error boundary, and any failure degrades to the inline fallback.
 */
export function CustomBlock({ name, raw }: CustomBlockProps) {
  const entry = blockRegistry[name]
  if (!entry) {
    warn(`unknown block "${name}"`)
    return <BlockFallback />
  }

  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch (error) {
    warn(`invalid JSON for block "${name}"`, error)
    return <BlockFallback />
  }

  if (entry.kind === 'local') {
    const parsed = entry.schema.safeParse(data)
    if (!parsed.success) {
      warn(`data failed validation for block "${name}"`, parsed.error.issues)
      return <BlockFallback />
    }
    const Component = entry.Component
    return (
      <BlockErrorBoundary fallback={<BlockFallback />}>
        <Suspense fallback={<ComponentSkeleton />}>
          <div className="animate-float-in my-3">
            <Component data={parsed.data} />
          </div>
        </Suspense>
      </BlockErrorBoundary>
    )
  }

  return (
    <BlockErrorBoundary fallback={<BlockFallback />}>
      <Suspense fallback={<ComponentSkeleton />}>
        <div className="animate-float-in my-3">
          <RemoteBlock name={name} load={entry.load} data={data} />
        </div>
      </Suspense>
    </BlockErrorBoundary>
  )
}
