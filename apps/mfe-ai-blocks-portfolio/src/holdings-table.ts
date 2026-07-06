import './index.css'
import { holdingsTableSchema, type HoldingsTableData } from '@bank-poc/shared'
import HoldingsTable from './HoldingsTable'

/** Plain-text serialization for copy: a header line + one line per holding. */
function toText(data: HoldingsTableData): string {
  const cur = data.currency ?? 'RM'
  const money = (n: number) => `${cur}${n.toLocaleString('en-US')}`
  const header = `${data.title ?? 'Holdings'}${data.total != null ? ` — total ${money(data.total)}` : ''}`
  const rows = data.holdings.map((h) => {
    const ret =
      h.returnPct != null ? ` (${h.returnPct >= 0 ? '+' : ''}${h.returnPct}%)` : ''
    return `• ${h.name}: ${money(h.value)}${ret}`
  })
  return [header, ...rows].join('\n')
}

export default { schema: holdingsTableSchema, Component: HoldingsTable, toText }
