import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Orb } from './Orb'
import { useTypewriter } from '../hooks/useTypewriter'

/** How long a phrase stays fully typed before the next one starts. */
const HOLD_MS = 2200

/** Shown while waiting for the assistant's reply: the orb plus a cycling,
 *  self-typing status line. Each phrase types out, holds, then the next
 *  phrase replaces it, looping until the reply arrives. */
export function TypingIndicator() {
  const { t } = useTranslation()
  // Cycled while we wait on the backend so the user knows we're still working.
  const phrases = t('chat.typing', { returnObjects: true }) as unknown as string[]
  const [index, setIndex] = useState(0)
  const timer = useRef<number | undefined>(undefined)

  const text = useTypewriter(phrases[index % phrases.length], true, () => {
    timer.current = window.setTimeout(
      () => setIndex((i) => (i + 1) % phrases.length),
      HOLD_MS,
    )
  })

  useEffect(() => () => window.clearTimeout(timer.current), [])

  return (
    <div className="flex items-center gap-2.5">
      <Orb size={26} active loading className="shrink-0" />
      <span className="text-sm text-white/50">
        {text}
        <span className="ml-0.5 inline-block h-4 w-px translate-y-0.5 animate-pulse bg-white/70" />
      </span>
    </div>
  )
}
