import { useCallback, useEffect, useRef, useState } from 'react'

/** Whether the browser exposes the Web Speech synthesis API. */
export const speechSupported =
  typeof window !== 'undefined' && 'speechSynthesis' in window

/**
 * On-device text-to-speech via the Web Speech API (no network/LLM). Speech is a
 * single global channel, so starting one utterance cancels any other in flight;
 * each hook resets its own `speaking` state off the utterance's end/error event,
 * which fires when another bubble's speak() interrupts it. Stops on unmount so
 * navigating away doesn't leave the page talking.
 */
export function useSpeech() {
  const [speaking, setSpeaking] = useState(false)
  const speakingRef = useRef(false)

  const update = useCallback((value: boolean) => {
    speakingRef.current = value
    setSpeaking(value)
  }, [])

  useEffect(
    () => () => {
      // Only stop playback if *this* hook is the one currently speaking — cancel
      // is global, so an idle bubble unmounting mustn't silence another.
      if (speakingRef.current) speechSynthesis.cancel()
    },
    [],
  )

  const stop = useCallback(() => {
    speechSynthesis.cancel()
    update(false)
  }, [update])

  const speak = useCallback(
    (text: string) => {
      if (!speechSupported || !text) return
      speechSynthesis.cancel() // single-channel: interrupt whatever's playing
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.onend = () => update(false)
      utterance.onerror = () => update(false)
      update(true)
      speechSynthesis.speak(utterance)
    },
    [update],
  )

  const toggle = useCallback(
    (text: string) => {
      if (speakingRef.current) stop()
      else speak(text)
    },
    [speak, stop],
  )

  return { speaking, toggle, supported: speechSupported }
}
