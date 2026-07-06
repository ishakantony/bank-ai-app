import { z } from 'zod'

/**
 * The AI insight card's data contract — the single source of truth for the card
 * Team B owns. It's exposed alongside the component (see `insight-card.ts`) so
 * the carousel (Team A) can Zod-validate the feed's opaque `data` against it at
 * runtime, without any compile-time dependency on this shape.
 *
 * The card renders a full-bleed spend insight for the mobile home carousel: a
 * headline blurb + hero amount + a delta badge, above a category bar chart.
 */
export const insightCardSchema = z.object({
  /**
   * Which layout to render. The card fills whatever cell it's placed in, so the
   * feed picks the variant that matches the slot: `hero` for the full-bleed
   * slide, `wide`/`tall` for a bento lead cell (col-span-2 / row-span-2), and
   * `compact` for a single bento cell. Defaults to `hero`.
   */
  variant: z.enum(['hero', 'wide', 'tall', 'compact']).optional(),
  /** Prose blurb shown above/next to the hero amount (hidden on `compact`). */
  headline: z.string(),
  /** The period this insight covers, shown as an eyebrow, e.g. "June". */
  period: z.string(),
  /** Hero stat: total spend for the period. */
  amount: z.number().nonnegative(),
  /** Currency prefix; defaults to "RM". */
  currency: z.string().optional(),
  /** Optional delta badge text, e.g. "+45% vs 6-mo avg". */
  delta: z.string().optional(),
  /** Badge tone; defaults to "warning". */
  deltaTone: z.enum(['positive', 'negative', 'warning', 'info']).optional(),
  /** Category spend driving the bar chart (largest first reads best). */
  categories: z
    .array(
      z.object({
        label: z.string(),
        amount: z.number().nonnegative(),
      }),
    )
    .min(1),
  /** Optional call-to-action label on the card's action pill. */
  cta: z.string().optional(),
  /**
   * Tapping the card deep-links into the Bank AI chat app and starts a
   * conversation (like the shell's "Your Banking Summary" row):
   *   - `topic` — the chat topic to open, e.g. "insights". Omit for a regular
   *     (general) chat. When it names a specific insight, that thread opens.
   *   - `prompt` — the message to seed the conversation with. Omit to just open
   *     the chat with no message.
   * With neither, the card opens a plain regular chat.
   */
  topic: z.string().optional(),
  prompt: z.string().optional(),
})

export type InsightCardData = z.infer<typeof insightCardSchema>
