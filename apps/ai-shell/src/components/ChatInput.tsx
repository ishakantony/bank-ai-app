import { useEffect, useRef, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Orb } from './Orb'

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (value: string) => void
  /** When true, the textarea and send button are locked (e.g. while streaming). */
  disabled?: boolean
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  disabled = false,
}: ChatInputProps) {
  const { t } = useTranslation()
  const [focused, setFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const canSend = !disabled && value.trim().length > 0

  // Touch devices (Android/iOS WebView) follow the mobile convention: Enter
  // inserts a newline and the dedicated Send button submits. Only physical
  // keyboards get Enter-to-submit.
  const [isTouch] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia?.('(pointer: coarse)').matches === true,
  )

  // Auto-grow the textarea to fit its content (capped via max-height).
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [value])

  function submit() {
    if (!canSend) return
    onSubmit(value.trim())
  }

  return (
    <div
      className="relative rounded-[1.4rem] p-[1.5px] transition-shadow duration-500"
      style={{
        background:
          'conic-gradient(from var(--angle), var(--color-accent-1), var(--color-accent-2), var(--color-accent-3), var(--color-accent-1))',
        animation: `spin-angle ${focused ? '3.5s' : '9s'} linear infinite`,
        opacity: focused ? 1 : 0.6,
        boxShadow: focused
          ? '0 0 40px -8px rgba(150,120,255,0.55)'
          : 'none',
      }}
    >
      <div className="flex items-end gap-3 rounded-[1.3rem] bg-ink-deep/95 px-3 py-2.5 backdrop-blur-xl">
        <Orb
          size={32}
          active={focused}
          loading={focused}
          className="mb-0.5 shrink-0 transition-opacity duration-300"
        />

        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => {
            // Soft keyboards (esp. Android) fire unreliable key events while an
            // IME composition is in flight (key 'Unidentified' / keyCode 229);
            // never treat those as a submit.
            if (e.nativeEvent.isComposing || e.keyCode === 229) return
            if (e.key === 'Enter' && !e.shiftKey && !isTouch) {
              e.preventDefault()
              submit()
            }
          }}
          disabled={disabled}
          rows={1}
          placeholder={disabled ? t('chat.replying') : t('chat.inputPlaceholder')}
          className="no-scrollbar max-h-40 flex-1 resize-none bg-transparent py-1.5 text-[15px] leading-relaxed text-white placeholder:text-white/40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
        />

        <button
          type="button"
          // Keep the textarea focused so the soft keyboard stays open. Without
          // this the tap blurs the textarea, the keyboard dismisses, the
          // `h-dvh` bottom bar reflows downward, and the button slides out from
          // under the finger before `click` fires — so submit never runs.
          onPointerDown={(e) => e.preventDefault()}
          onClick={submit}
          disabled={!canSend}
          aria-label={t('chat.sendMessage')}
          className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-accent-1 to-accent-2 text-white shadow-lg transition duration-200 enabled:hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowUp className="size-5" strokeWidth={2.25} />
        </button>
      </div>
    </div>
  )
}
