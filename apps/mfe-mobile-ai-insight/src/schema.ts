import { z } from 'zod'

/**
 * The AI insight card's data contract — the single source of truth for the card
 * Team B owns. It's exposed alongside the component (see `insight-card.ts`) so
 * the carousel (Team A) can Zod-validate the feed's opaque `data` against it at
 * runtime, without any compile-time dependency on this shape.
 *
 * The card is **prose-first**: its real content is `introText`, a markdown
 * paragraph with inline `:hl[…]{tone=…}` highlights (the number/percentage is a
 * colored highlight, not a separate chrome "stat"). The visualization is a
 * secondary `widget` that only `hero`/`wide` render; `tall`/`compact` show
 * introText only. A fixed "Full Insight" CTA floats bottom-right and deep-links
 * into `ctaUrl` when tapped.
 *
 * `widgetData` is deliberately **lenient** (`unknown`) so an unknown/malformed
 * widget payload still passes the carousel's boundary `safeParse` and reaches
 * the card, which then validates it against the matched widget's own schema and
 * degrades to introText + CTA (no widget) rather than being rejected at the
 * boundary and disappearing. Per-widget validation lives inside the card — see
 * `widgets/`.
 */
export const insightCardSchema = z.object({
  /**
   * Which layout to render. The card fills whatever cell it's placed in, so the
   * feed picks the variant that matches the slot: `hero` for the full-bleed
   * slide, `wide`/`tall` for a bento lead cell (col-span-2 / row-span-2), and
   * `compact` for a single bento cell. Defaults to `hero`. Only `hero`/`wide`
   * render the widget; `tall`/`compact` are introText-only.
   */
  variant: z.enum(['hero', 'wide', 'tall', 'compact']).optional(),
  /**
   * Which inner visualization to render (hero/wide only). Selects a widget from
   * the registry (`widgets/`): `categories` (default — ranked bar chart),
   * `donut`, `gauge`, `progress`, `countdown`. An unknown widget degrades to
   * introText-only. Defaults to `categories`.
   */
  widget: z.string().optional(),
  /**
   * The card's real content: a markdown paragraph supporting our inline
   * `:hl[text]{tone=positive|negative|warning|info}` highlight directive. The
   * headline number/delta lives here as a colored highlight.
   */
  introText: z.string(),
  /**
   * The URL the "Full Insight" CTA opens (in a new tab). Typically a deeplink into
   * the Bank AI chat — e.g. `/chat?topic=insights&message=…`. Omit to render the
   * CTA as inert.
   */
  ctaUrl: z.string().optional(),
  /**
   * The per-widget payload. Opaque at the boundary (`unknown`); the card
   * validates it against the matched widget's schema and, if it doesn't fit (or
   * `widget` is unknown), renders introText + CTA with no widget.
   */
  widgetData: z.unknown(),
})

export type InsightCardData = z.infer<typeof insightCardSchema>
