import { useEffect, useRef, useState } from 'react'
import { Check, Globe } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { LOCALES, type Locale } from '@bank-poc/shared'

/** Short chip label per locale, shown on the trigger button. */
const SHORT: Record<Locale, string> = { en: 'EN', ms: 'BM', zh: '中文' }

/**
 * Compact glass dropdown for choosing the app language. Picking a locale calls
 * `i18n.changeLanguage` — the detector persists it to localStorage
 * (`bank-ai-lang`) and the language-keyed query keys refetch backend data, so no
 * manual cache invalidation is needed.
 */
export function LanguageSwitcher() {
  const { t, i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const current = (LOCALES as string[]).includes(i18n.language)
    ? (i18n.language as Locale)
    : 'en'

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return
    function onPointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
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

  function select(locale: Locale) {
    i18n.changeLanguage(locale)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={t('languageSwitcher.label')}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/70 backdrop-blur-md transition hover:border-white/25 hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-1/70"
      >
        <Globe className="size-4" />
        {SHORT[current]}
      </button>

      {open ? (
        <ul
          role="listbox"
          className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-xl border border-white/10 bg-ink-deep/95 p-1 shadow-2xl backdrop-blur-xl"
        >
          {LOCALES.map((locale) => (
            <li key={locale}>
              <button
                type="button"
                role="option"
                aria-selected={locale === current}
                onClick={() => select(locale)}
                className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                {t(`languageSwitcher.${locale}`)}
                {locale === current ? (
                  <Check className="size-4 text-accent-3" />
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
