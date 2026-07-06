import './index.css'
import { portfolioValueSchema, type PortfolioValueData } from '@bank-poc/shared'
import PortfolioValue from './PortfolioValue'

/** Plain-text serialization for copy: a one-line summary of the value chart. */
function toText(data: PortfolioValueData): string {
  const cur = data.currency ?? 'RM'
  const money = (n: number) => `${cur}${Math.abs(n).toLocaleString('en-US')}`
  let change = ''
  if (data.gain != null || data.gainPct != null) {
    const parts: string[] = []
    if (data.gain != null) parts.push(`${data.gain >= 0 ? '+' : '-'}${money(data.gain)}`)
    if (data.gainPct != null) parts.push(`${data.gainPct >= 0 ? '+' : ''}${data.gainPct}%`)
    change = ` (${parts.join(', ')}${data.periodLabel ? ` over ${data.periodLabel}` : ''})`
  }
  return `Portfolio value: ${money(data.value)}${change}`
}

// The exposed contract: the host validates incoming block JSON against this
// schema (fetched with the component at runtime) before rendering, so the host
// never needs a compile-time dependency on the block's data shape. `toText`
// rides along for clipboard copy.
export default { schema: portfolioValueSchema, Component: PortfolioValue, toText }
