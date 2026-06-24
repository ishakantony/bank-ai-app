import { useEffect, useRef, useState } from 'react'
import { ArrowUp } from 'lucide-react'
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
  const [focused, setFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const canSend = !disabled && value.trim().length > 0

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
          className="mb-0.5 shrink-0 transition-opacity duration-300"
        />

        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              submit()
            }
          }}
          disabled={disabled}
          rows={1}
          placeholder={disabled ? 'Bank AI is replying…' : 'Ask Bank AI anything…'}
          className="max-h-40 flex-1 resize-none bg-transparent py-1.5 text-[15px] leading-relaxed text-white placeholder:text-white/40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
        />

        <button
          type="button"
          onClick={submit}
          disabled={!canSend}
          aria-label="Send message"
          className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-accent-1 to-accent-2 text-white shadow-lg transition duration-200 enabled:hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowUp className="size-5" strokeWidth={2.25} />
        </button>
      </div>
    </div>
  )
}
