import type { ReactNode } from 'react'
import type { z } from 'zod'
import type { BaseCardData } from '../schema'
import type { Variant } from '../card-chrome'

/**
 * A card body kind. Each preset owns its own per-preset data schema (extending
 * `baseCardSchema` so the shared chrome fields come along), a `Visual` that
 * renders the body for a given variant, and an optional `stat` that returns the
 * prominent figure the scaffold shows above the visual.
 *
 * The card resolves `preset` → a `Preset`, validates the payload with `schema`,
 * and hands the parsed data to `Visual`/`stat`. The generic `Data` is the
 * inferred shape (always a superset of `BaseCardData`), so `Visual`/`stat` see a
 * fully-typed payload while the registry can hold them under a common type.
 */
export interface Preset<Data extends BaseCardData = BaseCardData> {
  schema: z.ZodType<Data>
  Visual: (props: { data: Data; variant: Variant }) => ReactNode
  stat?: (data: Data) => ReactNode
}

/**
 * Helper to define a preset while keeping its `Data` bound to the schema — so a
 * preset's `Visual`/`stat` are typed against exactly what its schema parses,
 * and the result still fits the registry's `Preset` (erased to `BaseCardData`).
 */
export function definePreset<Data extends BaseCardData>(
  preset: Preset<Data>,
): Preset {
  return preset as unknown as Preset
}
