import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { RotateCcw, SlidersHorizontal, Volume2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useSpeech, useVoices } from '../hooks/useSpeech'
import { useSpeechStore } from '../store/speechStore'

/** i18n language → BCP-47 tag, mirroring the map in MessageActions. */
const SPEECH_LANG: Record<string, string> = {
  en: 'en-US',
  ms: 'ms-MY',
  zh: 'zh-CN',
}

/**
 * Glass popover (built on the LanguageSwitcher pattern) for tuning read-aloud:
 * voice, speed, pitch, and volume. Choices persist via `useSpeechStore`. The voice
 * list is filtered to the current app language, with an "Auto" option that clears
 * the preference so playback auto-picks by language (the original behavior).
 */
export function SpeechSettings() {
  const { t, i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  // The panel is portaled to <body> so it escapes the chat header's fading
  // mask (AppShell's overlay bar), which would otherwise clip a tall dropdown.
  const [pos, setPos] = useState({ top: 0, right: 0 })
  const voices = useVoices()
  const { toggle: toggleSpeech, supported } = useSpeech()

  const voiceURI = useSpeechStore((s) => s.voiceURI)
  const rate = useSpeechStore((s) => s.rate)
  const pitch = useSpeechStore((s) => s.pitch)
  const volume = useSpeechStore((s) => s.volume)
  const setVoice = useSpeechStore((s) => s.setVoice)
  const setRate = useSpeechStore((s) => s.setRate)
  const setPitch = useSpeechStore((s) => s.setPitch)
  const setVolume = useSpeechStore((s) => s.setVolume)
  const reset = useSpeechStore((s) => s.reset)

  const base = i18n.language.split('-')[0]
  const speechLang = SPEECH_LANG[base] ?? i18n.language

  // Prefer voices matching the current language; if none match, offer them all.
  const listed = useMemo(() => {
    const matching = voices.filter((v) => v.lang.split('-')[0] === base)
    return matching.length ? matching : voices
  }, [voices, base])

  // Anchor the portaled panel under the trigger's right edge (mirrors `right-0
  // mt-2`). Recomputed on open and on viewport resize.
  useEffect(() => {
    if (!open) return
    const place = () => {
      const rect = triggerRef.current?.getBoundingClientRect()
      if (rect)
        setPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right })
    }
    place()
    window.addEventListener('resize', place)
    return () => window.removeEventListener('resize', place)
  }, [open])

  // Close on outside click / Escape. The panel lives in a portal, so it isn't a
  // DOM descendant of the trigger — check both refs before closing.
  useEffect(() => {
    if (!open) return
    function onPointerDown(e: PointerEvent) {
      const target = e.target as Node
      if (
        !ref.current?.contains(target) &&
        !panelRef.current?.contains(target)
      )
        setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!supported) return null

  const preview = () =>
    toggleSpeech(t('speechSettings.sample'), {
      lang: speechLang,
      voiceURI,
      rate,
      pitch,
      volume,
    })

  return (
    <div ref={ref} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={t('speechSettings.label')}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="grid size-9 place-items-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-1/70"
      >
        <SlidersHorizontal className="size-5" />
      </button>

      {open
        ? createPortal(
            <div
              ref={panelRef}
              role="dialog"
              aria-label={t('speechSettings.label')}
              style={{ top: pos.top, right: pos.right }}
              className="fixed z-50 w-72 space-y-4 rounded-xl border border-white/10 bg-ink-deep/95 p-4 shadow-2xl backdrop-blur-xl"
            >
          <div className="space-y-1.5">
            <label
              htmlFor="speech-voice"
              className="text-xs font-medium text-white/60"
            >
              {t('speechSettings.voice')}
            </label>
            <select
              id="speech-voice"
              value={voiceURI ?? ''}
              onChange={(e) => setVoice(e.target.value || null)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 transition hover:border-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-1/70"
            >
              <option value="">{t('speechSettings.auto')}</option>
              {listed.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>

          <Slider
            label={t('speechSettings.speed')}
            value={rate}
            min={0.5}
            max={2}
            step={0.1}
            onChange={setRate}
          />
          <Slider
            label={t('speechSettings.pitch')}
            value={pitch}
            min={0}
            max={2}
            step={0.1}
            onChange={setPitch}
          />
          <Slider
            label={t('speechSettings.volume')}
            value={volume}
            min={0}
            max={1}
            step={0.1}
            onChange={setVolume}
          />

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={preview}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 transition hover:border-white/25 hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-1/70"
            >
              <Volume2 className="size-4" />
              {t('speechSettings.preview')}
            </button>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-white/50 transition hover:text-white/80"
            >
              <RotateCcw className="size-3.5" />
              {t('speechSettings.reset')}
            </button>
          </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}

interface SliderProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (n: number) => void
}

/** Labeled range slider with a live value readout. */
function Slider({ label, value, min, max, step, onChange }: SliderProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs font-medium text-white/60">
        <span>{label}</span>
        <span className="tabular-nums text-white/80">{value.toFixed(1)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="w-full accent-accent-1"
      />
    </div>
  )
}
