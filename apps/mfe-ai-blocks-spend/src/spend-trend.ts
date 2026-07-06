import './index.css'
import { spendTrendSchema, type SpendTrendData } from '@bank-poc/shared'
import SpendTrend from './SpendTrend'

/** Plain-text serialization for copy: a one-line summary of the trend chart. */
function toText(data: SpendTrendData): string {
  const cur = data.currency ?? 'RM'
  return `${data.currentLabel} spending: ${cur}${data.spend.toLocaleString('en-US')} across ${data.transactions} transactions (vs ${data.previousLabel})`
}

// The exposed contract: the host validates incoming block JSON against this
// schema (fetched with the component at runtime) before rendering, so the host
// never needs a compile-time dependency on the block's data shape. `toText`
// rides along for clipboard copy.
export default { schema: spendTrendSchema, Component: SpendTrend, toText }
