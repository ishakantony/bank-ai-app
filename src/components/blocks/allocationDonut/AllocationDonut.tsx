import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import type { AllocationDonutData } from './schema'
import { BlockCard } from '../BlockCard'
import { ACCENTS } from '../colors'

/**
 * Donut/ring chart of a current allocation. Segment sizes are taken straight
 * from the provided values (Recharts handles the proportions), and a compact
 * legend below lists each slice as a percentage of the total.
 */
export default function AllocationDonut({ data }: { data: AllocationDonutData }) {
  const total = data.slices.reduce((sum, s) => sum + s.value, 0) || 1

  return (
    <BlockCard title={data.title ?? 'Current allocation'}>
      <div className="flex items-center gap-4">
        <div className="h-32 w-32 shrink-0">
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
                  <Cell key={slice.label} fill={ACCENTS[i % ACCENTS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <ul className="flex-1 space-y-1.5 text-[13px]">
          {data.slices.map((slice, i) => (
            <li key={slice.label} className="flex items-center gap-2">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: ACCENTS[i % ACCENTS.length] }}
              />
              <span className="text-white/80">{slice.label}</span>
              <span className="ml-auto font-medium text-white/90">
                {Math.round((slice.value / total) * 100)}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </BlockCard>
  )
}
