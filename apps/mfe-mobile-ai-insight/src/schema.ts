import { z } from 'zod'

/**
 * The AI insight card's data contract — the single source of truth for the card
 * Team B owns. It's exposed alongside the component (see `insight-card.ts`) so
 * the carousel (Team A) can Zod-validate the feed's opaque `data` against it at
 * runtime, without any compile-time dependency on this shape.
 *
 * The exposed schema is deliberately **lenient**: `data` is `unknown`. This is
 * so an unknown/malformed `preset` payload still passes the carousel's boundary
 * `safeParse` and reaches the card, which then validates against the matched
 * preset's own schema and degrades to a fallback card (rather than being
 * rejected at the boundary and disappearing). Per-preset validation lives inside
 * the card — see `presets/`.
 */
export const insightCardSchema = z.object({
  /**
   * Which layout to render. The card fills whatever cell it's placed in, so the
   * feed picks the variant that matches the slot: `hero` for the full-bleed
   * slide, `wide`/`tall` for a bento lead cell (col-span-2 / row-span-2), and
   * `compact` for a single bento cell. Defaults to `hero`.
   */
  variant: z.enum(['hero', 'wide', 'tall', 'compact']).optional(),
  /**
   * Which inner visualization to render in the card body. Selects a preset from
   * the registry (`presets/`): `categories` (default — ranked bar chart),
   * `donut`, `gauge`, `progress`, `countdown`. An unknown preset degrades to a
   * default fallback card. Defaults to `categories`.
   */
  preset: z.string().optional(),
  /**
   * The per-preset payload. Opaque at the boundary (`unknown`); the card
   * validates it against the matched preset's schema (each extends
   * `baseCardSchema`) and falls back if it doesn't fit.
   */
  data: z.unknown(),
})

export type InsightCardData = z.infer<typeof insightCardSchema>

/**
 * The chrome fields every preset shares — the deep-blue card's headline, period
 * eyebrow, delta badge, and deep-link. Each preset's schema `.extend()`s this
 * with its own visualization fields, so the shared `CardScaffold` can render the
 * chrome uniformly while the preset owns only its body.
 */
export const baseCardSchema = z.object({
  /** Prose blurb shown above the visual (clamped; hidden on `compact`). */
  headline: z.string(),
  /** The period this insight covers, shown as an eyebrow, e.g. "June". */
  period: z.string(),
  /** Optional delta badge text, e.g. "+45% vs 6-mo avg". */
  delta: z.string().optional(),
  /** Badge tone; defaults to "warning". */
  deltaTone: z.enum(['positive', 'negative', 'warning', 'info']).optional(),
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

/** The chrome fields shared by every preset, resolved once by `CardScaffold`. */
export type BaseCardData = z.infer<typeof baseCardSchema>
