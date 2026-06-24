import type { ReactNode } from 'react'

/**
 * Inline highlight authored as a `:hl[text]{tone=...}` markdown directive (see
 * the authoring contract in Markdown.tsx). Renders the text as a soft tinted
 * pill so a word like "drifted" carries meaning at a glance on the dark column.
 *
 * Degrades gracefully, the same way custom blocks do: an unknown tone renders
 * the text plain (warning in dev only) and a missing tone falls back to `info`,
 * so a model mistake costs a missing tint — never a missing word.
 */
const TONES = {
  positive: 'bg-tone-positive/15 text-tone-positive', // gains, on-track
  negative: 'bg-tone-negative/15 text-tone-negative', // losses, drift, risk
  warning: 'bg-tone-warning/15 text-tone-warning', // attention, deadlines
  info: 'bg-tone-info/15 text-tone-info', // neutral emphasis
} as const

type Tone = keyof typeof TONES

function isTone(value: string): value is Tone {
  return value in TONES
}

export function Highlight({ tone, children }: { tone?: string; children: ReactNode }) {
  if (tone === undefined || tone === '') {
    return <mark className={`rounded px-1 ${TONES.info}`}>{children}</mark>
  }
  if (!isTone(tone)) {
    if (import.meta.env.DEV) {
      console.warn(`[highlight] unknown tone "${tone}" — rendering plain`)
    }
    return <>{children}</>
  }
  return <mark className={`rounded px-1 ${TONES[tone]}`}>{children}</mark>
}
