import { useCallback, useEffect, useRef, useState } from 'react'
import {
  speechProvider,
  speechSupported,
  type SpeakParams,
  type VoiceInfo,
} from './speechProvider'

/** Whether this environment can speak (Web Speech, or the Android native bridge). */
export { speechSupported }

/** Options for a spoken utterance; all optional and default to engine defaults. */
export type SpeakOptions = Omit<SpeakParams, 'text'>

/**
 * The installed synthesis voices, kept in sync with the provider. `getVoices()`
 * is frequently empty on first call (voices load lazily on both the Web Speech
 * and native engines), so this subscribes and re-reads on every change — any UI
 * listing voices must use this hook or it renders an empty list.
 */
export function useVoices(): VoiceInfo[] {
  const [voices, setVoices] = useState<VoiceInfo[]>(() =>
    speechProvider.getVoices(),
  )

  useEffect(() => {
    // Re-read in case voices arrived between the initial render and this effect.
    setVoices(speechProvider.getVoices())
    return speechProvider.subscribeVoices(() =>
      setVoices(speechProvider.getVoices()),
    )
  }, [])

  return voices
}

/** id generator mirroring `chatStore`: crypto.randomUUID is unavailable in the
 * insecure contexts (http://) Android WebView often loads over. */
function newId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `spk-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

/**
 * On-device text-to-speech (no network/LLM). Speech is a single global channel
 * owned by the provider, so starting one utterance cancels any other in flight;
 * each hook resets its own `speaking` state off the utterance's end/error
 * callback, which the provider fires when another bubble's speak() interrupts
 * it. Stops on unmount so navigating away doesn't leave the page talking.
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
      if (speakingRef.current) speechProvider.cancel()
    },
    [],
  )

  const stop = useCallback(() => {
    speechProvider.cancel()
    update(false)
  }, [update])

  const speak = useCallback(
    (text: string, opts: SpeakOptions = {}) => {
      if (!speechSupported || !text) return
      speechProvider.speak(
        newId(),
        { text, ...opts },
        { onend: () => update(false), onerror: () => update(false) },
      )
      update(true)
    },
    [update],
  )

  const toggle = useCallback(
    (text: string, opts: SpeakOptions = {}) => {
      if (speakingRef.current) stop()
      else speak(text, opts)
    },
    [speak, stop],
  )

  return { speaking, toggle, supported: speechSupported }
}
