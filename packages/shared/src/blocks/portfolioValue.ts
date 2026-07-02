import { z } from 'zod'

/**
 * A portfolio value overview: a hero total value with an optional gain/loss
 * figure above an area chart of the value over time. `series` is a running
 * value keyed by period label (month, quarter, …), so the line traces how the
 * portfolio grew; `gain`/`gainPct` describe the change over `periodLabel` and
 * are tinted by `gainTone` (defaults inferred from the sign of `gain`).
 * `currency` defaults to "RM".
 */
export const portfolioValueSchema = z.object({
  /** Hero stat: current total portfolio value. */
  value: z.number().nonnegative(),
  /** Currency prefix; defaults to "RM". */
  currency: z.string().optional(),
  /** Caption for the period the change covers, e.g. "Past 12 months". */
  periodLabel: z.string().optional(),
  /** Absolute change over the period, e.g. 12400 or -3200. */
  gain: z.number().optional(),
  /** Percentage change over the period, e.g. 8.2. */
  gainPct: z.number().optional(),
  /** Tone for the gain/loss badge; inferred from `gain`'s sign when omitted. */
  gainTone: z.enum(['positive', 'negative', 'flat']).optional(),
  /** Value per period label, oldest → newest; drives the area chart. */
  series: z.array(z.object({ label: z.string(), value: z.number() })).min(1),
})
export type PortfolioValueData = z.infer<typeof portfolioValueSchema>
