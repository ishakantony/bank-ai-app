import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
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
  const panelRef = useRef<HTMLUListElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  // The list is portaled to <body> so it escapes the chat header's fading mask
  // (AppShell's overlay bar), which would otherwise clip the dropdown.
  const [pos, setPos] = useState({ top: 0, right: 0 })
  const current = (LOCALES as string[]).includes(i18n.language)
    ? (i18n.language as Locale)
    : 'en'

  // Anchor the portaled list under the trigger's right edge (mirrors `right-0
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

  // Close on outside click / Escape. The list lives in a portal, so it isn't a
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

  function select(locale: Locale) {
    i18n.changeLanguage(locale)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        ref={triggerRef}
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

      {open
        ? createPortal(
            <ul
              ref={panelRef}
              role="listbox"
              style={{ top: pos.top, right: pos.right }}
              className="fixed z-50 w-44 overflow-hidden rounded-xl border border-white/10 bg-ink-deep/95 p-1 shadow-2xl backdrop-blur-xl"
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
            </ul>,
            document.body,
          )
        : null}
    </div>
  )
}
