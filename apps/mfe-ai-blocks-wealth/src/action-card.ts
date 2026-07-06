import './index.css'
import { actionCardSchema, type ActionCardData } from '@bank-poc/shared'
import ActionCard from './ActionCard'

/** Plain-text serialization for copy: optional title, one line per action, cta. */
function toText(data: ActionCardData): string {
  const lines: string[] = []
  if (data.title) lines.push(data.title)
  for (const a of data.actions) {
    lines.push(`• ${a.label}${a.detail ? ` — ${a.detail}` : ''}`)
  }
  if (data.cta) lines.push(data.cta.label)
  return lines.join('\n')
}

export default { schema: actionCardSchema, Component: ActionCard, toText }
