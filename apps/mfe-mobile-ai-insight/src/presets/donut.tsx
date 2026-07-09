import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { z } from 'zod'
import { baseCardSchema } from '../schema'
import { PALETTE, money } from '../card-chrome'
import { definePreset } from './types'

/**
 * `donut` — a category ring. A recharts donut of the slices (colours cycle
 * `PALETTE`) beside a compact legend of percentages; the total is the stat.
 * Mirrors the AI shell's `allocationDonut` block. On the tighter tiles the
 * legend is dropped and the ring stands alone.
 */
const schema = baseCardSchema.extend({
  /** Optional total shown as the stat (defaults to the sum of the slices). */
  amount: z.number().nonnegative().optional(),
  /** Currency prefix; defaults to "RM". */
  currency: z.string().optional(),
  /** Ring segments; each slice's `value` sets its proportion. */
  slices: z
    .array(z.object({ label: z.string(), value: z.number().nonnegative() }))
    .min(1),
})

type Data = z.infer<typeof schema>

function Donut({ data, legend }: { data: Data; legend?: boolean }) {
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

export default definePreset({
  schema,
  stat: (data) =>
    money(
      data.currency,
      data.amount ?? data.slices.reduce((sum, s) => sum + s.value, 0),
    ),
  // Only the wide hero has room for the ring + legend side by side; the narrow
  // bento tiles (wide/tall/compact) show the ring alone.
  Visual: ({ data, variant }) => (
    <Donut data={data} legend={variant === 'hero'} />
  ),
})
