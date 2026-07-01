import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import type { DriftBarsData } from '@bank-ai/shared'
import { BlockCard } from '../BlockCard'
import { ACCENTS } from '../colors'

/**
 * Grouped horizontal bars comparing a target vs current value per item, with a
 * drift badge (▲ over / ▼ under) per row so it's obvious what needs correcting.
 */
export default function DriftBars({ data }: { data: DriftBarsData }) {
  const unit = data.unit ?? '%'

  return (
    <BlockCard title={data.title ?? 'Target vs current'}>
      <div style={{ height: data.items.length * 52 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data.items}
            layout="vertical"
            barCategoryGap="28%"
            margin={{ top: 0, right: 8, bottom: 0, left: 0 }}
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="label"
              width={72}
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(255,255,255,0.75)', fontSize: 12 }}
            />
            <Bar
              dataKey="target"
              fill="rgba(255,255,255,0.18)"
              radius={[0, 4, 4, 0]}
              isAnimationActive={false}
            />
            <Bar
              dataKey="current"
              fill={ACCENTS[0]}
              radius={[0, 4, 4, 0]}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <ul className="mt-2 space-y-1 text-[13px]">
        {data.items.map((item) => {
          const drift = item.current - item.target
          const over = drift > 0
          const flat = drift === 0
          return (
            <li key={item.label} className="flex items-center gap-2">
              <span className="text-white/70">{item.label}</span>
              <span className="ml-auto tabular-nums text-white/55">
                {item.current}
                {unit} / {item.target}
                {unit}
              </span>
              <span
                className={
                  'w-14 text-right font-medium tabular-nums ' +
                  (flat
                    ? 'text-white/40'
                    : over
                      ? 'text-glow-warm'
                      : 'text-accent-3')
                }
              >
                {flat ? '—' : `${over ? '▲ +' : '▼ '}${drift}${unit}`}
              </span>
            </li>
          )
        })}
      </ul>

      <div className="mt-3 flex items-center gap-4 text-[11px] text-white/45">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-white/20" /> Target
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="size-2.5 rounded-sm"
            style={{ backgroundColor: ACCENTS[0] }}
          />{' '}
          Current
        </span>
      </div>
    </BlockCard>
  )
}
