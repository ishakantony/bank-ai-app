import { useEffect, useRef, useState } from 'react'

const STEP = 2 // characters revealed per tick
const INTERVAL = 16 // ms between ticks (~60fps)

// Markup that must reveal atomically rather than typing out character by
// character: custom-component fences (```bank:<name>``` … ```) — whose raw JSON
// we never want to see — and inline `:hl[text]{tone=...}` highlights, whose
// directive syntax would otherwise leak mid-word. Once the cursor enters one of
// these we jump straight to its end so it appears (and fades in) in one frame.
const ATOMIC = [/```bank:[\w-]+\n[\s\S]*?\n```/g, /:hl\[[^\]]*\]\{[^}]*\}/g]

/** Byte ranges [start, end) of every atomic span in the text. */
function fenceRanges(text: string): Array<[number, number]> {
  const ranges: Array<[number, number]> = []
  for (const pattern of ATOMIC) {
    for (const match of text.matchAll(pattern)) {
      ranges.push([match.index, match.index + match[0].length])
    }
  }
  return ranges
}

/** If `i` lands inside an atomic span, snap it to that span's end. */
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
