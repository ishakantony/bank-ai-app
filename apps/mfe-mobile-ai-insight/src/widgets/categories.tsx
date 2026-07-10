import { lazy } from 'react'
import { z } from 'zod'
import { defineWidget } from './types'

/**
 * `categories` — the default widget. A ranked horizontal bar chart of category
 * spend. The prose (total, delta) lives in the card's `introText`; this widget
 * owns only the bars.
 *
 * The `schema` stays eager here (the card's `safeParse` runs synchronously), but
 * the recharts-heavy render lives in `categories.visual.tsx` and is pulled in
 * via `React.lazy` — so recharts loads only when a `categories` card renders.
 */
const schema = z.object({
  /** Category spend driving the bar chart (largest first reads best). */
  categories: z
    .array(z.object({ label: z.string(), amount: z.number().nonnegative() }))
    .min(1),
})

export type CategoriesData = z.infer<typeof schema>

export default defineWidget({
  schema,
  Visual: lazy(() => import('./categories.visual')),
})
