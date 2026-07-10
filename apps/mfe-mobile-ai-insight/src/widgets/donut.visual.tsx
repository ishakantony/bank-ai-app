import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { PALETTE } from '../card-chrome'
import type { WidgetProps } from './types'
// Type-only import of the schema-inferred shape — no runtime edge back to
// donut.tsx, so recharts stays isolated to this lazily-loaded chunk.
import type { DonutData } from './donut'

/**
 * The recharts donut: a category ring (colours cycle `PALETTE`) beside a compact
 * legend of percentages. Split out of donut.tsx and loaded via `React.lazy` so
 * the ~550KB recharts share chunk downloads only when a `donut` card renders —
 * never for pure-SVG widgets or introText-only cards.
 */
export default function DonutVisual({ data, variant }: WidgetProps<DonutData>) {
  // Only the hero has room for the ring + legend side by side; the narrow `wide`
  // tile shows the ring alone.
  const legend = variant === 'hero'
  const total = data.slices.reduce((sum, s) => sum + s.value, 0) || 1
  return (
    <div className="flex h-full w-full items-center gap-3">
      <div className="h-full min-h-0 shrink-0 self-stretch" style={{ aspectRatio: '1 / 1' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data.slices}
              dataKey="value"
              nameKey="label"
              innerRadius="62%"
              outerRadius="100%"
              paddingAngle={2}
              stroke="none"
              isAnimationActive={false}
            >
              {data.slices.map((slice, i) => (
                <Cell key={slice.label} fill={PALETTE[i % PALETTE.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      {legend ? (
        <ul className="min-w-0 flex-1 space-y-1 text-[11px]">
          {data.slices.map((slice, i) => (
            <li key={slice.label} className="flex items-center gap-1.5">
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: PALETTE[i % PALETTE.length] }}
              />
              <span className="truncate text-white/80">{slice.label}</span>
              <span className="ml-auto shrink-0 font-medium text-white/90">
                {Math.round((slice.value / total) * 100)}%
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
