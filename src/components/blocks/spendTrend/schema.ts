import { z } from 'zod'

/**
 * A spending overview: two hero stats (total spend + transaction count) above a
 * dual-line cumulative chart comparing this period against the previous one.
 * Both `current` and `previous` are running totals keyed by day-of-month, so the
 * lines climb across the month; `current` typically stops at today (`markerDay`,
 * where a dashed marker sits) while `previous` runs the full month, faded.
 */
export const spendTrendSchema = z.object({
  /** Hero stat: total spend so far this period. */
  spend: z.number().nonnegative(),
  /** Hero stat: transaction count this period. */
  transactions: z.number().int().nonnegative(),
  /** Currency prefix; defaults to "RM". */
  currency: z.string().optional(),
  /** Legend/end label for the solid (current) line, e.g. "June". */
  currentLabel: z.string(),
  /** Legend/end label for the faded (previous) line, e.g. "May". */
  previousLabel: z.string(),
  /** Day-of-month for the dashed "today" marker; defaults to the last `current` day. */
  markerDay: z.number().optional(),
  /** Cumulative running total per day-of-month, current period. */
  current: z.array(z.object({ day: z.number(), amount: z.number() })).min(1),
  /** Cumulative running total per day-of-month, previous period. */
  previous: z.array(z.object({ day: z.number(), amount: z.number() })).min(1),
})
export type SpendTrendData = z.infer<typeof spendTrendSchema>
