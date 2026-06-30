import { z } from 'zod'

/**
 * A detailed spending breakdown: a header (period total + a "vs avg" badge) over
 * a list of category rows. Each row shows an icon, label, `percent` (driving a
 * coloured progress bar), `amount`, and an optional `delta` vs the usual rhythm
 * — coloured by `deltaTone` (or inferred from a leading +/-/Flat in `delta`):
 * an increase reads amber, a decrease green, flat is muted. `currency` defaults
 * to "RM". `icon` keys into the component's ICONS map.
 */
export const spendBreakdownSchema = z.object({
  /** Heading, e.g. "May Spend"; defaults to "Spending breakdown". */
  title: z.string().optional(),
  /** Currency prefix; defaults to "RM". */
  currency: z.string().optional(),
  /** Period total spend. */
  total: z.number().nonnegative(),
  /** Header badge, e.g. "+RM2,110". */
  vsAvg: z.string().optional(),
  /** Sub-line beneath the badge, e.g. "vs. 6-Month Avg". */
  vsAvgLabel: z.string().optional(),
  categories: z
    .array(
      z.object({
        label: z.string(),
        /** Key into the ICONS map; falls back to a wallet glyph. */
        icon: z.string().optional(),
        /** Share of total, drives the bar width. */
        percent: z.number(),
        amount: z.number().nonnegative(),
        /** Delta vs usual, e.g. "+RM530", "-RM22", "Flat". */
        delta: z.string().optional(),
        deltaTone: z
          .enum(['positive', 'negative', 'warning', 'info', 'flat'])
          .optional(),
      }),
    )
    .min(1),
})
export type SpendBreakdownData = z.infer<typeof spendBreakdownSchema>
