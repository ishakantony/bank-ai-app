import { z } from 'zod'
import { baseCardSchema } from '../schema'
import { MINT } from '../card-chrome'
import { definePreset } from './types'

/**
 * `progress` — a big-percent goal bar. The completion percent is the prominent
 * stat; the body is a CSS track with a mint fill and a glowing knob at the fill
 * head (the pattern from the AI shell's `spendBreakdown` rows), plus an optional
 * caption + a "value of max" label. Good for a savings-goal or budget-used read.
 */
const schema = baseCardSchema.extend({
  /** Progress value. With `max` omitted it's read as a 0–100 percentage. */
  value: z.number(),
  /** The target the value is measured against; defaults to 100. */
  max: z.number().positive().optional(),
  /** Caption above the bar, e.g. "Emergency fund". */
  label: z.string().optional(),
  /** Absolute figure shown under the bar, e.g. "RM8,200 of RM10,000". */
  valueLabel: z.string().optional(),
})

type Data = z.infer<typeof schema>

function pct(data: Data) {
  const max = data.max ?? 100
  return Math.max(0, Math.min(100, max === 0 ? 0 : (data.value / max) * 100))
}

function ProgressBar({ data }: { data: Data }) {
  const p = pct(data)
  return (
    <div className="flex h-full w-full flex-col justify-center gap-1.5">
      {data.label ? (
        <p className="truncate text-[11px] font-medium text-white/70">{data.label}</p>
      ) : null}
      <div className="relative h-2 w-full rounded-full bg-white/10">
        <div
          className="h-full rounded-full"
          style={{
            width: `${p}%`,
            background: `linear-gradient(90deg, color-mix(in oklab, ${MINT} 70%, transparent), ${MINT})`,
          }}
        />
        <span
          className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
          style={{ left: `${p}%`, boxShadow: `0 0 10px 1px ${MINT}` }}
        />
      </div>
      {data.valueLabel ? (
        <p className="num text-[11px] tabular-nums text-white/60">{data.valueLabel}</p>
      ) : null}
    </div>
  )
}

export default definePreset({
  schema,
  stat: (data) => `${Math.round(pct(data))}%`,
  Visual: ({ data }) => <ProgressBar data={data} />,
})
