import './index.css'
import { allocationDonutSchema, type AllocationDonutData } from '@bank-poc/shared'
import AllocationDonut from './AllocationDonut'

/** Plain-text serialization for copy: a one-line breakdown of the ring shares. */
function toText(data: AllocationDonutData): string {
  const total = data.slices.reduce((sum, s) => sum + s.value, 0) || 1
  const shares = data.slices
    .map((s) => `${s.label} ${Math.round((s.value / total) * 100)}%`)
    .join(', ')
  return `${data.title ?? 'Allocation'}: ${shares}`
}

export default { schema: allocationDonutSchema, Component: AllocationDonut, toText }
