import './index.css'
import { spendBreakdownSchema, type SpendBreakdownData } from '@bank-poc/shared'
import SpendBreakdown from './SpendBreakdown'

/** Plain-text serialization for copy: a header line + one line per category. */
function toText(data: SpendBreakdownData): string {
  const cur = data.currency ?? 'RM'
  const money = (n: number) => `${cur}${n.toLocaleString('en-US')}`
  const badge = data.vsAvg
    ? ` (${data.vsAvg}${data.vsAvgLabel ? ` ${data.vsAvgLabel}` : ''})`
    : ''
  const header = `${data.title ?? 'Spending breakdown'} — total ${money(data.total)}${badge}`
  const rows = data.categories.map(
    (c) =>
      `• ${c.label}: ${money(c.amount)} (${c.percent}%)${c.delta ? `, ${c.delta}` : ''}`,
  )
  return [header, ...rows].join('\n')
}

export default { schema: spendBreakdownSchema, Component: SpendBreakdown, toText }
