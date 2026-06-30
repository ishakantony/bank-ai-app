import { z } from 'zod'

/**
 * A spending overview ring: two hero stats (total spend + transaction count,
 * each with an optional "vs AVG" badge) above a donut whose centre carries the
 * `month` name and whose `categories` are splayed left/right around it with
 * dashed leader lines. Each category's `percent` defaults to its share of the
 * total amount; `side` can pin a label left or right (otherwise auto-split).
 * `currency` defaults to "RM"; `vsAvgTone` (badge colour) defaults to "warning".
 */
export const spendDonutSchema = z.object({
  /** Centred ring label, e.g. "May". */
  month: z.string(),
  /** Currency prefix; defaults to "RM". */
  currency: z.string().optional(),
  /** Hero stat: total spend this period. */
  spend: z.number().nonnegative(),
  /** Hero stat: transaction count this period. */
  transactions: z.number().int().nonnegative(),
  /** Spend badge text, e.g. "+45% vs AVG". */
  spendVsAvg: z.string().optional(),
  /** Transactions badge text, e.g. "+25 vs AVG". */
  txnVsAvg: z.string().optional(),
  /** Tone for both stat badges; defaults to "warning". */
  vsAvgTone: z.enum(['positive', 'negative', 'warning', 'info']).optional(),
  categories: z
    .array(
      z.object({
        label: z.string(),
        amount: z.number().nonnegative(),
        /** Share of total; computed from `amount` when omitted. */
        percent: z.number().optional(),
        /** Pin the label to a side; auto-split when omitted. */
        side: z.enum(['left', 'right']).optional(),
      }),
    )
    .min(1),
})
export type SpendDonutData = z.infer<typeof spendDonutSchema>
