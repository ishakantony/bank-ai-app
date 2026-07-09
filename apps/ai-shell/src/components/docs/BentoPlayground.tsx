import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AlertTriangle, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { CopyButton } from './CopyButton'
import { useInsightCard } from './useInsightCard'
import { BlockErrorBoundary } from '../blocks/BlockErrorBoundary'

const PILL =
  'inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[13px] font-medium text-white/80 backdrop-blur transition hover:-translate-y-px hover:border-white/20 hover:bg-white/10 hover:text-white'

/** The four bento layout variants, each rendered in a representative slot. */
const FRAMES: { variant: string; w: number; h: number }[] = [
  { variant: 'hero', w: 360, h: 220 },
  { variant: 'wide', w: 360, h: 130 },
  { variant: 'tall', w: 176, h: 300 },
  { variant: 'compact', w: 176, h: 130 },
]

/** A bundled default card, used to seed the editor when the remote's docs don't load. */
const DEFAULT_CARD = {
  variant: 'hero',
  preset: 'categories',
  data: {
    period: 'June',
    headline: 'Dining and Raya travel led your spend — up sharply on your 6-month rhythm.',
    amount: 6800,
    currency: 'RM',
    delta: '+45% vs 6-mo avg',
    deltaTone: 'warning',
    cta: 'Full Insight',
    topic: 'insights',
    prompt: 'Break down my June spending and why it jumped 45%',
    categories: [
      { label: 'Dining', amount: 2450 },
      { label: 'Travel', amount: 1980 },
      { label: 'Shopping', amount: 1420 },
      { label: 'Groceries', amount: 950 },
    ],
  },
}

/** Encode editor text into a URL-safe `?json=` value (handles non-ASCII). */
function encodeJson(text: string): string {
  return btoa(encodeURIComponent(text))
}

/** Reverse of `encodeJson`; returns null if the value is malformed. */
function decodeJson(value: string | null): string | null {
  if (!value) return null
  try {
    return decodeURIComponent(atob(value))
  } catch {
    return null
  }
}

/**
 * The Bento tab — a JSON editor for the mobile AI insight card (the
 * `mobileAiInsight` remote's `insightCard` block) with a live preview in all
 * four layout variants at once (hero / wide / tall / compact). Mirrors the
 * markdown Playground's UX: variant presets, a copy button, and a shareable
 * base64 `?json=` URL. The card is loaded directly from its remote, isolated
 * from the shared block registry (it's a sized mobile bento card, not a chat
 * reply block), so it never appears in the Custom Blocks gallery.
 */
export function BentoPlayground() {
  const { t } = useTranslation()
  const state = useInsightCard()
  const [params] = useSearchParams()

  // Preset examples from the remote's ./docs, falling back to a bundled default.
  const presets = useMemo(() => {
    const examples = state.status === 'ready' ? state.docs?.examples : undefined
    if (examples && examples.length) return examples
    return [{ label: 'Hero (full slide)', data: DEFAULT_CARD }]
  }, [state])

  const [value, setValue] = useState(
    () =>
      decodeJson(params.get('json')) ??
      JSON.stringify(presets[0].data, null, 2),
  )

  // Parse + validate against the remote-provided schema. On any failure, surface
  // the messages in an inline panel and skip the preview (nicer than a silent
  // fallback while authoring).
  const parsed = useMemo(() => {
    let data: unknown
    try {
      data = JSON.parse(value)
    } catch (e) {
      return { ok: false as const, kind: 'json' as const, error: (e as Error).message }
    }
    if (state.status !== 'ready') return { ok: true as const, data }
    const result = state.module.schema.safeParse(data)
    if (!result.success) {
      const messages = result.error.issues.map(
        (i) => `${i.path.join('.') || '(root)'}: ${i.message}`,
      )
      return { ok: false as const, kind: 'schema' as const, error: messages.join('\n') }
    }
    return { ok: true as const, data: result.data }
  }, [value, state])

  function share() {
    const url = `${window.location.origin}${window.location.pathname}?tab=bento&json=${encodeJson(value)}`
    navigator.clipboard.writeText(url).then(
      () => toast(t('docs.bento.shareCopied')),
      () => toast(t('docs.bento.shareFailed')),
    )
  }

  if (state.status === 'loading') {
    return (
      <div className="animate-float-in rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center text-sm text-white/45">
        {t('docs.bento.remoteLoading')}
      </div>
    )
  }

  if (state.status === 'error') {
    return (
      <div className="animate-float-in rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center backdrop-blur-md">
        <AlertTriangle className="mx-auto size-6 text-tone-warning" />
        <p className="mt-3 text-sm font-medium text-white/85">
          {t('docs.bento.remoteError')}
        </p>
        <p className="mt-1 text-xs text-white/50">{t('docs.bento.remoteHint')}</p>
      </div>
    )
  }

  const Component = state.module.Component

  return (
    <div className="animate-float-in space-y-4 pb-16">
      {/* Toolbar: presets + document actions */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-white/40">
          {t('docs.bento.startFrom')}
        </span>
        {presets.map((p) => (
          <button
            key={p.label}
            type="button"
            className={PILL}
            onClick={() => setValue(JSON.stringify(p.data, null, 2))}
          >
            {p.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <CopyButton value={value} label={t('docs.bento.copyJson')} />
          <button
            type="button"
            onClick={share}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-white/70 transition hover:border-white/25 hover:bg-white/10 hover:text-white/90"
          >
            <Share2 className="size-3.5" />
            {t('docs.bento.share')}
          </button>
        </div>
      </div>

      {/* Editor + all-variants preview */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col">
          <div className="mb-2 text-xs font-medium uppercase tracking-wide text-white/40">
            JSON
          </div>
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            spellCheck={false}
            className="no-scrollbar min-h-[28rem] w-full flex-1 resize-y rounded-2xl border border-white/10 bg-black/30 p-4 font-mono text-[13px] leading-relaxed text-white/85 outline-none transition focus:border-white/25 focus-visible:ring-2 focus-visible:ring-accent-1/40"
          />
          {!parsed.ok && (
            <div className="mt-2 rounded-xl border border-tone-negative/40 bg-tone-negative/10 p-3">
              <p className="text-xs font-semibold text-tone-negative-fg">
                {parsed.kind === 'json'
                  ? t('docs.bento.invalidJson')
                  : t('docs.bento.validationFailed')}
              </p>
              <pre className="no-scrollbar mt-1 overflow-x-auto whitespace-pre-wrap text-[11px] leading-relaxed text-white/70">
                {parsed.error}
              </pre>
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <div className="mb-2 text-xs font-medium uppercase tracking-wide text-white/40">
            {t('docs.bento.preview')}
          </div>
          <div className="flex flex-wrap content-start gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md">
            {parsed.ok ? (
              FRAMES.map((f) => (
                <div key={f.variant} className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-white/40">
                    <span>{f.variant}</span>
                    <code className="font-mono normal-case text-white/30">
                      bank:insightCard
                    </code>
                  </div>
                  <div style={{ width: f.w, height: f.h }} className="shrink-0">
                    <BlockErrorBoundary
                      key={value}
                      fallback={
                        <div className="grid h-full w-full place-items-center rounded-2xl border border-white/10 bg-white/[0.03] text-xs text-white/45">
                          {t('docs.bento.renderError')}
                        </div>
                      }
                    >
                      <Component data={{ ...(parsed.data as object), variant: f.variant }} />
                    </BlockErrorBoundary>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-white/45">{t('docs.bento.fixToPreview')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
