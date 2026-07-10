import type { ReactNode } from 'react'
import type { InsightCardData } from './schema'
import { CardScaffold } from './card-chrome'
import { widgets, DEFAULT_WIDGET } from './widgets'

/**
 * A Bank AI insight card, owned by Team B and loaded into the mobile carousel
 * (Team A) via Module Federation. The payload is prose-first:
 * `{ variant, widget, introText, prompt, widgetData }`. `variant` picks the slot
 * size (hero / wide / tall / compact), `introText` is the markdown content (with
 * inline `:hl[…]{tone=…}` highlights), `prompt` seeds the "Full Insight"
 * deep-link, and — on hero/wide only — `widget` picks the secondary
 * visualization (`categories` bars by default, plus `donut`, `gauge`,
 * `progress`, `countdown`) whose payload is the opaque `widgetData`.
 *
 * `tall`/`compact` never show a widget. On hero/wide an unknown `widget` or a
 * `widgetData` that fails the widget's schema simply renders no widget (introText
 * + CTA) rather than crashing. Every variant fills its container. MYR /
 * Malaysia-flavored.
 */
export default function InsightCard({ data: payload }: { data: InsightCardData }) {
  const { variant = 'hero', widget = DEFAULT_WIDGET, introText, prompt, widgetData } = payload

  // tall/compact are introText-only; hero/wide resolve + validate the widget,
  // degrading to no visual if it's unknown or its data doesn't fit.
  let visual: ReactNode = null
  if (variant === 'hero' || variant === 'wide') {
    const resolved = widgets[widget]
    const parsed = resolved?.schema.safeParse(widgetData)
    if (parsed?.success) visual = <resolved.Visual data={parsed.data} variant={variant} />
  }

  return (
    <CardScaffold variant={variant} introText={introText} prompt={prompt} widget={visual} />
  )
}
