/**
 * Text-to-speech provider abstraction, chosen once at module load.
 *
 * Desktop browsers and iOS WKWebView implement the Web Speech synthesis API, so
 * they use `webSpeechProvider`. Android System WebView does **not** implement it,
 * so the Android shell injects a native `TextToSpeech` bridge (`window.BankTTS`)
 * and we route through `nativeProvider` instead. Provider selection is a
 * one-time decision — there's no runtime fallback — so the rest of the app
 * (`useSpeech`, `useVoices`) is provider-agnostic.
 */

/** A speakable voice, flattened from either the Web Speech or native voice list. */
export interface VoiceInfo {
  voiceURI: string
  name: string
  lang: string
}

/** A single utterance request. All fields but `text` default to engine defaults. */
export interface SpeakParams {
  text: string
  /** BCP-47 tag used to set the utterance language and auto-match a voice. */
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

/** Completion callbacks for an utterance; exactly one fires, exactly once. */
export interface SpeakHandlers {
  onend: () => void
  onerror: () => void
}

export interface SpeechProvider {
  /** Whether this environment can speak at all. */
  supported: boolean
  /** Start speaking; interrupts whatever's currently playing (single channel). */
  speak(id: string, params: SpeakParams, handlers: SpeakHandlers): void
  /** Stop the current utterance. */
  cancel(): void
  /** Synchronous snapshot of installed voices (may be empty before they load). */
  getVoices(): VoiceInfo[]
  /** Subscribe to voice-list changes; returns an unsubscribe fn. */
  subscribeVoices(cb: () => void): () => void
}

/** Native→JS event shapes posted by the Android bridge via `window.__bankTTS.emit`. */
type TtsEvent =
  | { type: 'start' | 'end' | 'error'; id: string }
  | { type: 'voices'; voices: VoiceInfo[] }

declare global {
  interface Window {
    /** Injected on Android via `addJavascriptInterface(bridge, "BankTTS")`. */
    BankTTS?: {
      speak(
        text: string,
        lang: string,
        rate: number,
        pitch: number,
        volume: number,
        voiceURI: string,
        utteranceId: string,
      ): void
      stop(): void
      getVoicesJson(): string
    }
    /** Installed by `nativeProvider`; the bridge calls `.emit` to post events. */
    __bankTTS?: { emit(event: TtsEvent): void }
  }
}

/**
 * Single-channel bookkeeping shared by both providers: speech is one global
 * output, so at most one utterance is "current". Starting a new one (or a
 * cancel) synthetically fires the previous utterance's `onend` — this is what
 * lets one bubble's read-aloud reset another bubble that was mid-playback.
 * Engine completion events are id-guarded so a stale `end`/`error` (e.g. from
 * the utterance we just flushed) can't reset the new speaker.
 */
function createChannel() {
  let current: { id: string; handlers: SpeakHandlers } | null = null

  function endCurrent() {
    if (!current) return
    const prev = current
    current = null
    prev.handlers.onend()
  }

  return {
    /** Record a new active utterance, ending the previous one first. */
    begin(id: string, handlers: SpeakHandlers) {
      endCurrent()
      current = { id, handlers }
    },
    /** Cancel the active utterance (fires its `onend`). */
    clear: endCurrent,
    /** Route an engine completion event, guarded by id. */
    finish(id: string, kind: 'end' | 'error') {
      if (!current || current.id !== id) return
      const { handlers } = current
      current = null
      if (kind === 'error') handlers.onerror()
      else handlers.onend()
    },
  }
}

const hasWebSpeech =
  typeof window !== 'undefined' && 'speechSynthesis' in window

function toVoiceInfo(v: SpeechSynthesisVoice): VoiceInfo {
  return { voiceURI: v.voiceURI, name: v.name, lang: v.lang }
}

/** Web Speech API provider — the behavior relocated out of the old `useSpeech`. */
function createWebSpeechProvider(): SpeechProvider {
  const channel = createChannel()

  return {
    supported: hasWebSpeech,
    speak(id, params, handlers) {
      if (!hasWebSpeech || !params.text) return
      channel.begin(id, handlers)
      speechSynthesis.cancel() // single-channel: interrupt whatever's playing

      const utterance = new SpeechSynthesisUtterance(params.text)
      utterance.rate = params.rate ?? 1
      utterance.pitch = params.pitch ?? 1
      utterance.volume = params.volume ?? 1

      const voices = speechSynthesis.getVoices()
      // A user-chosen voice wins when it's actually installed here — a persisted
      // voiceURI may reference a voice absent on this device, so fall back to the
      // language auto-match (and ultimately the engine default) rather than crash.
      const chosen = params.voiceURI
        ? voices.find((v) => v.voiceURI === params.voiceURI)
        : undefined
      if (chosen) {
        utterance.voice = chosen
        utterance.lang = chosen.lang
      } else if (params.lang) {
        // Without a lang the engine uses its default (usually English) voice,
        // which silently skips characters it can't pronounce (e.g. Chinese).
        // Set the BCP-47 tag and, if the browser has one loaded, a matching
        // voice so the reply is read in the language it was written in.
        utterance.lang = params.lang
        const base = params.lang.split('-')[0]
        const voice = voices.find(
          (v) => v.lang === params.lang || v.lang.split('-')[0] === base,
        )
        if (voice) utterance.voice = voice
      }
      utterance.onend = () => channel.finish(id, 'end')
      utterance.onerror = () => channel.finish(id, 'error')
      speechSynthesis.speak(utterance)
    },
    cancel() {
      channel.clear()
      if (hasWebSpeech) speechSynthesis.cancel()
    },
    getVoices() {
      return hasWebSpeech ? speechSynthesis.getVoices().map(toVoiceInfo) : []
    },
    subscribeVoices(cb) {
      if (!hasWebSpeech) return () => {}
      speechSynthesis.addEventListener('voiceschanged', cb)
      return () => speechSynthesis.removeEventListener('voiceschanged', cb)
    },
  }
}

/** Android native `TextToSpeech` provider, driven by the `window.BankTTS` bridge. */
function createNativeProvider(): SpeechProvider {
  const bridge = window.BankTTS!
  const channel = createChannel()
  const voiceSubs = new Set<() => void>()
  let voices: VoiceInfo[] = []

  function setVoices(next: VoiceInfo[]) {
    voices = next
    voiceSubs.forEach((cb) => cb())
  }

  // Seed voices from the synchronous snapshot; may be `[]` before the native
  // engine finishes init, in which case a `voices` event fills it in later.
  try {
    const parsed = JSON.parse(bridge.getVoicesJson())
    if (Array.isArray(parsed)) voices = parsed
  } catch {
    // Malformed JSON before init — leave voices empty; the event will refresh.
  }

  // Install the global the bridge posts events into. Doing this on module load
  // (rather than lazily) covers the init race where native pushes a `voices`
  // event before the web bundle has evaluated this module.
  window.__bankTTS = {
    emit(event) {
      if (event.type === 'voices') setVoices(event.voices)
      else if (event.type === 'end') channel.finish(event.id, 'end')
      else if (event.type === 'error') channel.finish(event.id, 'error')
      // 'start' is informational — `speaking` is already set optimistically.
    },
  }

  return {
    supported: true,
    speak(id, params, handlers) {
      if (!params.text) return
      channel.begin(id, handlers)
      bridge.speak(
        params.text,
        params.lang ?? '',
        params.rate ?? 1,
        params.pitch ?? 1,
        params.volume ?? 1,
        params.voiceURI ?? '',
        id,
      )
    },
    cancel() {
      channel.clear()
      bridge.stop()
    },
    getVoices() {
      return voices
    },
    subscribeVoices(cb) {
      voiceSubs.add(cb)
      return () => voiceSubs.delete(cb)
    },
  }
}

/** The provider for this environment — native on Android, Web Speech elsewhere. */
export const speechProvider: SpeechProvider =
  typeof window !== 'undefined' && window.BankTTS
    ? createNativeProvider()
    : createWebSpeechProvider()

/** Whether read-aloud is available at all in this environment. */
export const speechSupported = speechProvider.supported
