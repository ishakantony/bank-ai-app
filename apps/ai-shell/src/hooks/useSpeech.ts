import { useCallback, useEffect, useRef, useState } from 'react'

/** Whether the browser exposes the Web Speech synthesis API. */
export const speechSupported =
  typeof window !== 'undefined' && 'speechSynthesis' in window

/** Options for a spoken utterance; all optional and default to engine defaults. */
export interface SpeakOptions {
  /** BCP-47 tag used both to set `utterance.lang` and auto-match a voice. */
  lang?: string
  /** Preferred voice `voiceURI`; wins over the language auto-match when present. */
  voiceURI?: string | null
  /** Speed 0.5–2, defaults to 1. */
  rate?: number
  /** Pitch 0–2, defaults to 1. */
  pitch?: number
  /** Volume 0–1, defaults to 1. */
  volume?: number
}

/**
 * The installed synthesis voices, kept in sync with the async `voiceschanged`
 * event. `getVoices()` is frequently empty on first call (voices load lazily),
 * so any UI listing them must subscribe or it renders an empty list.
 */
export function useVoices() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>(() =>
    speechSupported ? speechSynthesis.getVoices() : [],
  )

  useEffect(() => {
    if (!speechSupported) return
    const sync = () => setVoices(speechSynthesis.getVoices())
    sync()
    speechSynthesis.addEventListener('voiceschanged', sync)
    return () => speechSynthesis.removeEventListener('voiceschanged', sync)
  }, [])

  return voices
}

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
    (text: string, opts: SpeakOptions = {}) => {
      if (!speechSupported || !text) return
      speechSynthesis.cancel() // single-channel: interrupt whatever's playing
      const { lang, voiceURI, rate, pitch, volume } = opts
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = rate ?? 1
      utterance.pitch = pitch ?? 1
      utterance.volume = volume ?? 1

      const voices = speechSupported ? speechSynthesis.getVoices() : []
      // A user-chosen voice wins when it's actually installed here — a persisted
      // voiceURI may reference a voice absent on this device, so fall back to the
      // language auto-match (and ultimately the engine default) rather than crash.
      const chosen = voiceURI
        ? voices.find((v) => v.voiceURI === voiceURI)
        : undefined
      if (chosen) {
        utterance.voice = chosen
        utterance.lang = chosen.lang
      } else if (lang) {
        // Without a lang the engine uses its default (usually English) voice,
        // which silently skips characters it can't pronounce (e.g. Chinese).
        // Set the BCP-47 tag and, if the browser has one loaded, a matching
        // voice so the reply is read in the language it was written in.
        utterance.lang = lang
        const base = lang.split('-')[0]
        const voice = voices.find(
          (v) => v.lang === lang || v.lang.split('-')[0] === base,
        )
        if (voice) utterance.voice = voice
      }
      utterance.onend = () => update(false)
      utterance.onerror = () => update(false)
      update(true)
      speechSynthesis.speak(utterance)
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
