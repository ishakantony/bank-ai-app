import { useState } from 'react'
import { Eye, EyeOff, type LucideIcon } from 'lucide-react'

interface AuthFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  icon: LucideIcon
  type?: 'text' | 'email' | 'password'
  placeholder?: string
  autoComplete?: string
  name?: string
}

/**
 * A labelled glass input whose border becomes a bright, faster-spinning
 * conic gradient on focus — the light-theme cousin of the web app's chat-input
 * border. Password fields get a show/hide toggle.
 */
export function AuthField({
  label,
  value,
  onChange,
  icon: Icon,
  type = 'text',
  placeholder,
  autoComplete,
  name,
}: AuthFieldProps) {
  const [focused, setFocused] = useState(false)
  const [reveal, setReveal] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword && reveal ? 'text' : type

  return (
    <label className="block">
      <span className="mb-1.5 block px-1 text-xs font-semibold uppercase tracking-wide text-ink-soft">
        {label}
      </span>
      <div
        className="relative rounded-2xl p-[1.5px] transition-shadow duration-500"
        style={{
          background:
            'conic-gradient(from var(--angle), var(--color-brand-1), var(--color-brand-2), var(--color-brand-3), var(--color-brand-1))',
          animation: `spin-angle ${focused ? '3.5s' : '11s'} linear infinite`,
          opacity: focused ? 1 : 0.35,
          boxShadow: focused
            ? '0 0 32px -10px var(--color-brand-2)'
            : 'none',
        }}
      >
        <div className="flex items-center gap-2.5 rounded-[calc(1rem-1px)] bg-white/85 px-3.5 py-3 backdrop-blur-xl">
          <Icon className="size-[18px] shrink-0 text-ink-soft" strokeWidth={2} />
          <input
            name={name}
            type={inputType}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={placeholder}
            autoComplete={autoComplete}
            className="min-w-0 flex-1 bg-transparent text-[15px] text-ink placeholder:text-ink-soft/60 focus:outline-none"
          />
          {isPassword ? (
            <button
              type="button"
              onClick={() => setReveal((r) => !r)}
              aria-label={reveal ? 'Hide password' : 'Show password'}
              className="shrink-0 rounded-full p-1 text-ink-soft transition hover:text-brand-1"
            >
              {reveal ? (
                <EyeOff className="size-[18px]" strokeWidth={2} />
              ) : (
                <Eye className="size-[18px]" strokeWidth={2} />
              )}
            </button>
          ) : null}
        </div>
      </div>
    </label>
  )
}
