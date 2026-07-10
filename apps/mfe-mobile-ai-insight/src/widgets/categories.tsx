import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { z } from 'zod'
import { PALETTE } from '../card-chrome'
import { defineWidget } from './types'

/**
 * `categories` — the default widget. A ranked horizontal bar chart of category
 * spend. The prose (total, delta) lives in the card's `introText`; this widget
 * owns only the bars.
 */
const schema = z.object({
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

export default defineWidget({
  schema,
  // Only hero/wide render a widget: hero labels the axis, wide is tight.
  Visual: ({ data, variant }) => (
    <Bars data={ranked(data)} labels={variant === 'hero'} />
  ),
})
