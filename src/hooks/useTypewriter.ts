import { useEffect, useRef, useState } from 'react'

const STEP = 2 // characters revealed per tick
const INTERVAL = 16 // ms between ticks (~60fps)

// Custom-component fences (```bank:<name>``` … ```) are revealed atomically: we
// never type their raw JSON out character by character. Instead, once the
// cursor enters a fence we jump straight to its end so the component appears in
// one frame (then fades in via the float-in animation).
const FENCE = /```bank:[\w-]+\n[\s\S]*?\n```/g

/** Byte ranges [start, end) of every bank: fence in the text. */
function fenceRanges(text: string): Array<[number, number]> {
  const ranges: Array<[number, number]> = []
  for (const match of text.matchAll(FENCE)) {
    ranges.push([match.index, match.index + match[0].length])
  }
  return ranges
}

/** If `i` lands inside a fence, snap it to that fence's end. */
function snapPastFence(i: number, ranges: Array<[number, number]>): number {
  for (const [start, end] of ranges) {
    if (i > start && i < end) return end
  }
  return i
}

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
    const ranges = fenceRanges(text)
    let i = 0
    const id = setInterval(() => {
      i = snapPastFence(Math.min(i + STEP, text.length), ranges)
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
