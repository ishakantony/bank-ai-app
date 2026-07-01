import { z } from 'zod'

/**
 * A branching questionnaire rendered as a `bank:wizard` block. The card teases
 * the first question; the drawer (opened via the block bus) walks the user
 * through it. Branching lives on each option's `next` — an option with no
 * `next` ends the flow. `id` is the bus key both the card and any `signal`
 * suggestion pill (e.g. "Reassess my needs") address.
 */
const wizardQuestionSchema = z.object({
  title: z.string(),
  options: z
    .array(
      z.object({
        value: z.string(),
        label: z.string(),
        /** Next question id; omit to make this option terminal. */
        next: z.string().optional(),
      }),
    )
    .min(1),
})
export const wizardSchema = z.object({
  /** Bus id — the coordination key, addressable across messages. */
  id: z.string(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  /** Id of the first question; must exist in `questions`. */
  start: z.string(),
  questions: z.record(z.string(), wizardQuestionSchema),
})
export type WizardData = z.infer<typeof wizardSchema>
