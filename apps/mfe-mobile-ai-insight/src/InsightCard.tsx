import type { InsightCardData } from './schema'
import { CardScaffold } from './card-chrome'
import { presets, DEFAULT_PRESET, FallbackCard } from './presets'

/**
 * A Bank AI insight card, owned by Team B and loaded into the mobile carousel
 * (Team A) via Module Federation. The payload is `{ variant, preset, data }`:
 * `variant` picks the slot size (hero / wide / tall / compact), `preset` picks
 * the inner visualization (`categories` bars by default, plus `donut`, `gauge`,
 * `progress`, `countdown`), and `data` is the opaque per-preset payload.
 *
 * The carousel's boundary schema is lenient (`data: unknown`) so an
 * unknown/invalid preset still reaches the card; here it's resolved and
 * validated: an unknown `preset` or a `data` that fails the preset's schema
 * degrades to a default `FallbackCard` (chrome + deep-link, no visual) rather
 * than crashing. Every variant fills its container. MYR / Malaysia-flavored.
 */
export default function InsightCard({ data: payload }: { data: InsightCardData }) {
  const { variant = 'hero', preset = DEFAULT_PRESET, data } = payload

  const resolved = presets[preset]
  if (!resolved) return <FallbackCard variant={variant} data={data} />

  const parsed = resolved.schema.safeParse(data)
  if (!parsed.success) return <FallbackCard variant={variant} data={data} />

  return (
    <CardScaffold
      variant={variant}
      chrome={parsed.data}
      stat={resolved.stat?.(parsed.data)}
      visual={<resolved.Visual data={parsed.data} variant={variant} />}
    />
  )
}
