import { useEffect, useRef, useState } from 'react'

const STEP = 2 // characters revealed per tick
const INTERVAL = 16 // ms between ticks (~60fps)

/**
 * Reveal `text` progressively when `enabled`, faking a streaming response.
 * When disabled it returns the full text immediately. Calls `onDone` once the
 * reveal completes (kept in a ref so changing the callback doesn't restart it).
 */
export function useTypewriter(
  text: string,
  enabled: boolean,
  onDone?: () => void,
) {
  const [count, setCount] = useState(enabled ? 0 : text.length)
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  useEffect(() => {
    if (!enabled) {
      setCount(text.length)
      return
    }
    setCount(0)
    let i = 0
    const id = setInterval(() => {
      i = Math.min(i + STEP, text.length)
      setCount(i)
      if (i >= text.length) {
        clearInterval(id)
        onDoneRef.current?.()
      }
    }, INTERVAL)
    return () => clearInterval(id)
  }, [text, enabled])

  return text.slice(0, count)
}
