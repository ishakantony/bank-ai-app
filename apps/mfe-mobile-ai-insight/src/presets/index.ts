import type { Preset } from './types'
import categories from './categories'
import donut from './donut'
import gauge from './gauge'
import progress from './progress'
import countdown from './countdown'

/**
 * The preset registry: `preset` id → body kind. `categories` is the default
 * (the card's original look). Adding a preset = drop a `presets/<name>.tsx`
 * self-contained file (schema + Visual + optional stat) and list it here; the
 * card resolves the payload's `preset` against this map and falls back if it's
 * missing.
 */
export const presets: Record<string, Preset> = {
  categories,
  donut,
  gauge,
  progress,
  countdown,
}

/** The id used when the payload omits `preset`. */
export const DEFAULT_PRESET = 'categories'

// Re-exported so the card can resolve a preset and its fallback from one place.
export { FallbackCard } from '../card-chrome'
export type { Preset } from './types'
