import './index.css'
import { spendDonutSchema, type SpendDonutData } from '@bank-poc/shared'
import SpendDonut from './SpendDonut'

/** Plain-text serialization for copy: a one-line summary of the spend ring. */
function toText(data: SpendDonutData): string {
  const cur = data.currency ?? 'RM'
  const vs = data.spendVsAvg ? ` (${data.spendVsAvg})` : ''
  return `${data.month} spending: ${cur}${data.spend.toLocaleString('en-US')} across ${data.transactions} transactions${vs}`
}

export default { schema: spendDonutSchema, Component: SpendDonut, toText }
