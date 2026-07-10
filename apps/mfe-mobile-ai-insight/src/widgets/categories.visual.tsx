import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { PALETTE } from '../card-chrome'
import type { WidgetProps } from './types'
// Type-only import of the schema-inferred shape — no runtime edge back to
// categories.tsx, so recharts stays isolated to this lazily-loaded chunk.
import type { CategoriesData } from './categories'

/** Largest category first so the bars read as a ranked breakdown. */
function ranked(data: CategoriesData) {
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

/**
 * The recharts ranked horizontal bar chart. Split out of categories.tsx and
 * loaded via `React.lazy` so the ~550KB recharts share chunk downloads only when
 * a `categories` card renders. Only hero/wide render a widget: hero labels the
 * axis, wide is tight.
 */
export default function CategoriesVisual({ data, variant }: WidgetProps<CategoriesData>) {
  return <Bars data={ranked(data)} labels={variant === 'hero'} />
}
