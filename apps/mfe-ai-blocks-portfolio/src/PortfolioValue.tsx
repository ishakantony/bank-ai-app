import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'
import type { PortfolioValueData } from '@bank-poc/shared'
import { BlockCard } from '@bank-poc/blocks-kit'

/** Brand green used for the value line/fill and the hero figure. */
const LINE = 'var(--color-glow-green)'

/** Tailwind text colour per gain tone. */
const TONE_TEXT: Record<
  NonNullable<PortfolioValueData['gainTone']>,
  string
> = {
  positive: 'text-tone-positive',
  negative: 'text-tone-negative',
  flat: 'text-white/45',
}

/** Infer a tone from the gain's sign when none is given. */
function inferTone(gain?: number): keyof typeof TONE_TEXT {
  if (gain === undefined || gain === 0) return 'flat'
  return gain > 0 ? 'positive' : 'negative'
}

/**
 * Portfolio value overview: a hero total value with an optional gain/loss badge
 * above a soft area chart tracing the value across `series` (oldest → newest).
 * The gain reads green for a rise, red for a fall, muted when flat, and its
 * text combines the absolute change and percent when both are supplied.
 */
export default function PortfolioValue({ data }: { data: PortfolioValueData }) {
  const currency = data.currency ?? 'RM'
  const tone = data.gainTone ?? inferTone(data.gain)
  const fmt = (n: number) => `${currency}${Math.abs(n).toLocaleString('en-MY')}`

  const sign = (data.gain ?? 0) > 0 ? '+' : (data.gain ?? 0) < 0 ? '−' : ''
  const gainParts = [
    data.gain !== undefined ? `${sign}${fmt(data.gain)}` : undefined,
    data.gainPct !== undefined
      ? `${sign}${Math.abs(data.gainPct).toLocaleString('en-MY')}%`
      : undefined,
  ].filter(Boolean)

  return (
    <BlockCard>
      <div className="mb-3">
        <p className="text-[11px] font-medium uppercase tracking-wide text-white/50">
          Portfolio value
        </p>
        <p className="text-2xl font-semibold tabular-nums text-glow-green">
          <span className="text-base text-white/55">{currency}</span>
          {data.value.toLocaleString('en-MY')}
        </p>
        <div className="mt-1.5 flex items-center gap-2">
          {gainParts.length ? (
            <span
              className={`inline-block rounded-md bg-white/5 px-2 py-0.5 text-[11px] font-medium tabular-nums ${TONE_TEXT[tone]}`}
            >
              {gainParts.join(' · ')}
            </span>
          ) : null}
          {data.periodLabel ? (
            <span className="text-[11px] text-white/45">{data.periodLabel}</span>
          ) : null}
        </div>
      </div>

      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.series} margin={{ top: 8, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="portfolioValueFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={LINE} stopOpacity={0.35} />
                <stop offset="100%" stopColor={LINE} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 12 }}
              interval="preserveStartEnd"
              minTickGap={24}
            />
            <YAxis hide domain={['dataMin', 'dataMax']} />
            <Area
              dataKey="value"
              stroke={LINE}
              strokeWidth={2.5}
              fill="url(#portfolioValueFill)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </BlockCard>
  )
}
