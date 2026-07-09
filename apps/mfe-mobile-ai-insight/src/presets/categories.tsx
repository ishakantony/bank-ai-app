import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { z } from 'zod'
import { baseCardSchema } from '../schema'
import { PALETTE, money } from '../card-chrome'
import { definePreset } from './types'

/**
 * `categories` — the default preset. A ranked horizontal bar chart of category
 * spend, with the period total as the prominent stat. This is the card's
 * original look, preserved so an unmigrated payload renders exactly as before.
 */
const schema = baseCardSchema.extend({
  /** Hero stat: total spend for the period. */
  amount: z.number().nonnegative(),
  /** Currency prefix; defaults to "RM". */
  currency: z.string().optional(),
  /** Category spend driving the bar chart (largest first reads best). */
  categories: z
    .array(z.object({ label: z.string(), amount: z.number().nonnegative() }))
    .min(1),
})

type Data = z.infer<typeof schema>

/** Largest category first so the bars read as a ranked breakdown. */
function ranked(data: Data) {
  return [...data.categories]
    .sort((a, b) => b.amount - a.amount)
    .map((c) => ({ label: c.label, amount: c.amount }))
}

/** Horizontal category bars. `labels` draws the axis labels (hero only). */
function Bars({
  data,
  labels,
}: {
  data: { label: string; amount: number }[]
  labels?: boolean
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 0, right: labels ? 8 : 2, bottom: 0, left: 0 }}
        barCategoryGap={labels ? '22%' : '16%'}
      >
        <XAxis type="number" hide domain={[0, 'dataMax']} />
        <YAxis
          type="category"
          dataKey="label"
          hide={!labels}
          axisLine={false}
          tickLine={false}
          width={72}
          interval={0}
          tick={{ fill: 'rgba(255,255,255,0.8)', fontSize: 11 }}
        />
        <Bar dataKey="amount" radius={[3, 3, 3, 3]} isAnimationActive={false}>
          {data.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export default definePreset({
  schema,
  stat: (data) => money(data.currency, data.amount),
  Visual: ({ data, variant }) => {
    // Hero labels the axis; the compact tile shows only the top three bars.
    const rows = variant === 'compact' ? ranked(data).slice(0, 3) : ranked(data)
    return <Bars data={rows} labels={variant === 'hero'} />
  },
})
