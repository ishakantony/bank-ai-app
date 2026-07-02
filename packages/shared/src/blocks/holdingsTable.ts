import { z } from 'zod'

/**
 * A holdings table: an optional header (title + total value) over a list of
 * holding rows. Each row shows an icon (keyed by `category` into the
 * component's ICONS map — e.g. epf/prs/asb/unitTrust/stocks/cash), the holding
 * `name`, its `value`, and an optional `returnPct` tinted by `returnTone` (or
 * inferred from the sign of `returnPct`): a gain reads green, a loss red, flat
 * is muted. `currency` defaults to "RM".
 */
export const holdingsTableSchema = z.object({
  /** Heading, e.g. "Your holdings"; defaults to "Holdings". */
  title: z.string().optional(),
  /** Currency prefix; defaults to "RM". */
  currency: z.string().optional(),
  /** Combined value shown in the header; omit to hide the header figure. */
  total: z.number().nonnegative().optional(),
  holdings: z
    .array(
      z.object({
        name: z.string(),
        /** Key into the ICONS map; falls back to a generic wallet glyph. */
        category: z.string().optional(),
        value: z.number().nonnegative(),
        /** Return over the holding period, e.g. 8.4 or -2.1. */
        returnPct: z.number().optional(),
        /** Tone for the return badge; inferred from `returnPct`'s sign when omitted. */
        returnTone: z.enum(['positive', 'negative', 'flat']).optional(),
      }),
    )
    .min(1),
})
export type HoldingsTableData = z.infer<typeof holdingsTableSchema>
