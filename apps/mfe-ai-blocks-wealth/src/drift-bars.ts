import './index.css'
import { driftBarsSchema, type DriftBarsData } from '@bank-poc/shared'
import DriftBars from './DriftBars'

/** Plain-text serialization for copy: a one-line current-vs-target summary. */
function toText(data: DriftBarsData): string {
  const unit = data.unit ?? '%'
  const items = data.items
    .map((i) => `${i.label} ${i.current}${unit} vs target ${i.target}${unit}`)
    .join('; ')
  return `${data.title ?? 'Allocation drift'}: ${items}`
}

export default { schema: driftBarsSchema, Component: DriftBars, toText }
