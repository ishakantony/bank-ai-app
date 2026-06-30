import {
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'
import type { SpendTrendData } from './schema'

/** Brand green used for the current (solid) line and the hero spend figure. */
const CURRENT = 'var(--color-glow-green)'
/** Faded white for the previous month's full-month line. */
const PREVIOUS = 'rgba(255,255,255,0.4)'

/**
 * Spending overview: two hero stats (total spend + transaction count) above a
 * dual-line cumulative chart. The current period climbs as a solid green line
 * up to today (`markerDay`, marked with a dashed rule); the previous period runs
 * the full month, faded. End amounts are labelled at the marker.
 */
export default function SpendTrend({ data }: { data: SpendTrendData }) {
  const currency = data.currency ?? 'RM'
  const markerDay = data.markerDay ?? data.current[data.current.length - 1].day

  const curByDay = new Map(data.current.map((p) => [p.day, p.amount]))
  const prevByDay = new Map(data.previous.map((p) => [p.day, p.amount]))
  const days = Array.from(
    new Set([...data.current, ...data.previous].map((p) => p.day)),
  ).sort((a, b) => a - b)
  const chartData = days.map((day) => ({
    day,
    current: curByDay.get(day),
    previous: prevByDay.get(day),
  }))
  const markerIndex = chartData.findIndex((d) => d.day === markerDay)

  const fmt = (n: number) => `${currency}${n.toLocaleString('en-MY')}`

  // Label drawn just right of a line's value at the marker day.
  function MarkerLabel({
    color,
    text,
  }: {
    color: string
    text: (value: number) => string
  }) {
    return function Label(props: {
      x?: string | number
      y?: string | number
      value?: unknown
      index?: number
    }) {
      if (props.index !== markerIndex || typeof props.value !== 'number') {
        return null
      }
      return (
        <text
          x={Number(props.x ?? 0) + 8}
          y={Number(props.y ?? 0) + 4}
          fill={color}
          fontSize={12}
          fontWeight={600}
        >
          {text(props.value)}
        </text>
      )
    }
  }

  return (
    <>
      <div className="mb-4 flex gap-10">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-white/50">
            Spend
          </p>
          <p className="text-2xl font-semibold tabular-nums text-glow-green">
            <span className="text-base text-white/55">{currency}</span>
            {data.spend.toLocaleString('en-MY')}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-white/50">
            Transactions
          </p>
          <p className="text-2xl font-semibold tabular-nums text-white/90">
            {data.transactions}
          </p>
        </div>
      </div>

      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 72, bottom: 0, left: 0 }}
          >
            <XAxis
              dataKey="day"
              type="number"
              domain={['dataMin', 'dataMax']}
              ticks={[days[0], markerDay, days[days.length - 1]]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 12 }}
            />
            <YAxis hide domain={[0, 'dataMax']} />
            <ReferenceLine
              x={markerDay}
              stroke="rgba(255,255,255,0.2)"
              strokeDasharray="3 4"
            />
            <Line
              dataKey="previous"
              stroke={PREVIOUS}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
              label={MarkerLabel({ color: 'rgba(255,255,255,0.75)', text: fmt })}
            />
            <Line
              dataKey="current"
              stroke={CURRENT}
              strokeWidth={2.5}
              connectNulls={false}
              dot={false}
              isAnimationActive={false}
              label={MarkerLabel({
                color: CURRENT,
                text: (v) => `${fmt(v)} ${data.currentLabel}`,
              })}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex items-center gap-4 text-[11px] text-white/45">
        <span className="flex items-center gap-1.5">
          <span
            className="size-2.5 rounded-sm"
            style={{ backgroundColor: CURRENT }}
          />
          {data.currentLabel}
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="size-2.5 rounded-sm"
            style={{ backgroundColor: PREVIOUS }}
          />
          {data.previousLabel}
        </span>
      </div>
    </>
  )
}
