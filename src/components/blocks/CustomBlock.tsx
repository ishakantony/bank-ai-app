import { Suspense } from 'react'
import { blockRegistry } from './registry'
import { BlockErrorBoundary } from './BlockErrorBoundary'
import { BlockFallback } from './BlockFallback'
import { ComponentSkeleton } from './ComponentSkeleton'

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
 * Renders one custom block from an assistant message. Resolves the name in the
 * registry, parses + validates the JSON against the block's Zod schema, and
 * renders the lazy component (fading in, wrapped in Suspense + an error
 * boundary). Any failure along the way degrades to the inline fallback notice.
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
