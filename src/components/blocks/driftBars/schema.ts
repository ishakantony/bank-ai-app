import { z } from 'zod'

export const driftBarsSchema = z.object({
  title: z.string().optional(),
  /** Unit appended to the axis/labels, e.g. "%". Defaults to "%". */
  unit: z.string().optional(),
  items: z
    .array(
      z.object({
        label: z.string(),
        target: z.number(),
        current: z.number(),
      }),
    )
    .min(1),
})
export type DriftBarsData = z.infer<typeof driftBarsSchema>
