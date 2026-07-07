import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface SpeechState {
  /** Preferred voice's `voiceURI`, or `null` to auto-pick by app language. */
  voiceURI: string | null
  /** Playback speed (0.5–2). */
  rate: number
  /** Voice pitch (0–2). */
  pitch: number
  /** Playback volume (0–1). */
  volume: number
  setVoice: (uri: string | null) => void
  setRate: (n: number) => void
  setPitch: (n: number) => void
  setVolume: (n: number) => void
  reset: () => void
}

const DEFAULTS = { voiceURI: null, rate: 1, pitch: 1, volume: 1 } as const

/**
 * Global, persisted read-aloud (text-to-speech) preferences. `voiceURI: null`
 * means "auto-pick by the current app language" — the original behavior. Persisted
 * to localStorage (`bank-ai-speech`, parallel to the `bank-ai-lang` convention) so
 * the choice survives across sessions. A persisted `voiceURI` may not exist on
 * another device/browser; playback in `useSpeech` falls back to language auto-match.
 */
export const useSpeechStore = create<SpeechState>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      setVoice: (uri) => set({ voiceURI: uri }),
      setRate: (rate) => set({ rate }),
      setPitch: (pitch) => set({ pitch }),
      setVolume: (volume) => set({ volume }),
      reset: () => set({ ...DEFAULTS }),
    }),
    {
      name: 'bank-ai-speech',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
