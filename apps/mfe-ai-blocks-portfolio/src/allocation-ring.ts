import './index.css'
import { allocationRingSchema, type AllocationRingData } from '@bank-poc/shared'
import AllocationRing from './AllocationRing'

/** Plain-text serialization for copy: a one-line allocation summary. */
function toText(data: AllocationRingData): string {
  const cur = data.currency ?? 'RM'
  const total = data.total ?? data.slices.reduce((sum, s) => sum + s.value, 0)
  const shares = data.slices
    .map((s) => `${s.label} ${s.percent ?? Math.round((s.value / total) * 100)}%`)
    .join(', ')
  return `Asset allocation — ${cur}${total.toLocaleString('en-US')}: ${shares}`
}

export default { schema: allocationRingSchema, Component: AllocationRing, toText }
