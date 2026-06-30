import { z } from 'zod'

export const actionCardSchema = z.object({
  title: z.string().optional(),
  actions: z
    .array(
      z.object({
        label: z.string(),
        detail: z.string().optional(),
      }),
    )
    .min(1),
  cta: z
    .object({
      label: z.string(),
    })
    .optional(),
})
export type ActionCardData = z.infer<typeof actionCardSchema>
