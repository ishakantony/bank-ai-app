import { z } from 'zod'

export const allocationDonutSchema = z.object({
  /** Optional heading shown above the ring. */
  title: z.string().optional(),
  /** Each ring segment. Values are relative; they don't need to sum to 100. */
  slices: z
    .array(
      z.object({
        label: z.string(),
        value: z.number().nonnegative(),
      }),
    )
    .min(1),
})
export type AllocationDonutData = z.infer<typeof allocationDonutSchema>
