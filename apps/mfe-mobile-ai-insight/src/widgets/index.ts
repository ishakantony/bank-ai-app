import type { Widget } from './types'
import categories from './categories'
import donut from './donut'
import gauge from './gauge'
import progress from './progress'
import countdown from './countdown'

/**
 * The widget registry: `widget` id → body kind. `categories` is the default.
 * Adding a widget = drop a `widgets/<name>.tsx` self-contained file (standalone
 * schema + Visual) and list it here; the card resolves the payload's `widget`
 * against this map and renders introText-only if it's missing.
 */
export const widgets: Record<string, Widget> = {
  categories,
  donut,
  gauge,
  progress,
  countdown,
}

/** The id used when the payload omits `widget`. */
export const DEFAULT_WIDGET = 'categories'

// Re-exported so the card can resolve a widget and its fallback from one place.
export { FallbackCard } from '../card-chrome'
export type { Widget } from './types'
