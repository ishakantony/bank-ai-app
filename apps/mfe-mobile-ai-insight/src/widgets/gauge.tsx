import { z } from 'zod'
import { MINT } from '../card-chrome'
import { defineWidget } from './types'

/**
 * `gauge` — a strategy/score arc. A 270° SVG ring with a rounded mint fill from
 * empty to `value / max`, the value (and optional unit) in the centre, and an
 * optional label beneath. No chart lib — pure SVG so it stays crisp at any tile
 * size. Good for a risk score, savings-rate, or goal-completion strategy read.
 */
const schema = z.object({
  /** The gauged value, e.g. a score or a percentage. */
  value: z.number(),
  /** The scale maximum; defaults to 100. */
  max: z.number().positive().optional(),
  /** Unit suffix shown next to the centre value, e.g. "%" or "/100". */
  unit: z.string().optional(),
  /** Caption beneath the value, e.g. "Balanced". */
  label: z.string().optional(),
})

type Data = z.infer<typeof schema>

// Gauge geometry: a 270° arc with the gap at the bottom, drawn clockwise from
// bottom-left (135°) round the top to bottom-right (405°/45°).
const CX = 60
const CY = 60
const R = 46
const START = 135
const SWEEP = 270

function pointAt(fraction: number) {
  const angle = ((START + SWEEP * fraction) * Math.PI) / 180
  return { x: CX + R * Math.cos(angle), y: CY + R * Math.sin(angle) }
}

function arc(fromFrac: number, toFrac: number) {
  const s = pointAt(fromFrac)
  const e = pointAt(toFrac)
  const large = SWEEP * (toFrac - fromFrac) > 180 ? 1 : 0
  return `M ${s.x} ${s.y} A ${R} ${R} 0 ${large} 1 ${e.x} ${e.y}`
}

function Gauge({ data, compact }: { data: Data; compact?: boolean }) {
  const max = data.max ?? 100
  const frac = Math.max(0, Math.min(1, max === 0 ? 0 : data.value / max))
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <svg
        viewBox="0 0 120 120"
        className="h-full max-h-full w-auto max-w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <path
          d={arc(0, 1)}
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={9}
          strokeLinecap="round"
        />
        {frac > 0 && (
          <path
            d={arc(0, frac)}
            fill="none"
            stroke={MINT}
            strokeWidth={9}
            strokeLinecap="round"
          />
        )}
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <p className="num font-semibold leading-none">
          <span className={compact ? 'text-lg' : 'text-2xl'}>{data.value}</span>
          {data.unit ? (
            <span className={`ml-0.5 text-white/60 ${compact ? 'text-[10px]' : 'text-xs'}`}>
              {data.unit}
            </span>
          ) : null}
        </p>
        {data.label ? (
          <p
            className={`mt-0.5 max-w-[80%] truncate text-center font-medium text-white/70 ${
              compact ? 'text-[9px]' : 'text-[11px]'
            }`}
          >
            {data.label}
          </p>
        ) : null}
      </div>
    </div>
  )
}

export default defineWidget({
  schema,
  // Rendered on hero/wide only; the tighter `wide` tile uses the compact layout.
  Visual: ({ data, variant }) => (
    <Gauge data={data} compact={variant === 'wide'} />
  ),
})
