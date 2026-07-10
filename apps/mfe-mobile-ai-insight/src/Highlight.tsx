import type { ReactNode } from 'react'

/**
 * Inline highlight authored as a `:hl[text]{tone=...}` markdown directive (see
 * the authoring contract in Markdown.tsx). Forked from the AI shell's Highlight
 * but tuned for the deep-blue insight card: instead of a soft tinted pill, the
 * number/percentage renders as **bright colored text** (the mockup shows
 * "SGD 6,800" as plain bright-green text) using the `--color-tone-*-fg` tokens
 * already in this remote's `index.css`.
 *
 * Degrades gracefully: an unknown tone renders the text plain (warning in dev
 * only) and a missing tone falls back to `info`, so a model mistake costs a
 * missing tint — never a missing word.
 */
const TONES = {
  positive: 'text-tone-positive-fg', // gains, on-track
  negative: 'text-tone-negative-fg', // losses, drift, risk
  warning: 'text-tone-warning-fg', // attention, deadlines
  info: 'text-tone-info-fg', // neutral emphasis
} as const

type Tone = keyof typeof TONES

function isTone(value: string): value is Tone {
  return value in TONES
}

export function Highlight({ tone, children }: { tone?: string; children: ReactNode }) {
  if (tone === undefined || tone === '') {
    return <span className={`font-semibold ${TONES.info}`}>{children}</span>
  }
  if (!isTone(tone)) {
    if (import.meta.env.DEV) {
      console.warn(`[highlight] unknown tone "${tone}" — rendering plain`)
    }
    return <>{children}</>
  }
  return <span className={`font-semibold ${TONES[tone]}`}>{children}</span>
}
