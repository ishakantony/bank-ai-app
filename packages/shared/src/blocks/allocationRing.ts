import { z } from 'zod'

/**
 * An asset-allocation ring: an optional centred total inside a donut whose
 * `slices` (asset classes — equities, fixed income, cash, unit trusts, …) are
 * splayed left/right around it with dashed leader lines. Each slice's `percent`
 * defaults to its share of the total value; `side` can pin a label left or
 * right (otherwise auto-split). `currency` defaults to "RM".
 */
export const allocationRingSchema = z.object({
  /** Centred ring label, e.g. "Total"; defaults to "Total". */
  title: z.string().optional(),
  /** Currency prefix; defaults to "RM". */
  currency: z.string().optional(),
  /** Combined value shown in the ring centre; computed from slices when omitted. */
  total: z.number().nonnegative().optional(),
  slices: z
    .array(
      z.object({
        label: z.string(),
        value: z.number().nonnegative(),
        /** Share of total; computed from `value` when omitted. */
        percent: z.number().optional(),
        /** Pin the label to a side; auto-split when omitted. */
        side: z.enum(['left', 'right']).optional(),
      }),
    )
    .min(1),
})
export type AllocationRingData = z.infer<typeof allocationRingSchema>
