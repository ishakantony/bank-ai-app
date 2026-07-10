import { lazy } from 'react'
import { z } from 'zod'
import { defineWidget } from './types'

/**
 * `donut` — a category ring. A recharts donut of the slices (colours cycle
 * `PALETTE`) beside a compact legend of percentages. Mirrors the AI shell's
 * `allocationDonut` block. The prose (total, delta) lives in the card's
 * `introText`; on the tighter `wide` tile the legend is dropped and the ring
 * stands alone.
 *
 * The `schema` stays eager here (the card's `safeParse` runs synchronously), but
 * the recharts-heavy render lives in `donut.visual.tsx` and is pulled in via
 * `React.lazy` — so recharts loads only when a `donut` card actually renders.
 */
const schema = z.object({
  /** Ring segments; each slice's `value` sets its proportion. */
  slices: z
    .array(z.object({ label: z.string(), value: z.number().nonnegative() }))
    .min(1),
})

export type DonutData = z.infer<typeof schema>

export default defineWidget({
  schema,
  Visual: lazy(() => import('./donut.visual')),
})
