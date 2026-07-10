import { useMemo, useState } from 'react'
import { AlertTriangle, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { CopyButton } from './CopyButton'
import { useInsightCard } from './useInsightCard'
import { BlockErrorBoundary } from '../blocks/BlockErrorBoundary'
import type { RemoteBlockModule } from '../blocks/defineBlock'

/** The four bento layout variants, each rendered in a representative slot. */
const FRAMES: { variant: string; w: number; h: number }[] = [
  { variant: 'hero', w: 360, h: 220 },
  { variant: 'wide', w: 360, h: 130 },
  { variant: 'tall', w: 176, h: 300 },
  { variant: 'compact', w: 176, h: 130 },
]

interface WidgetRow {
  widget: string
  label: string
  data: Record<string, unknown>
}

/**
 * One widget, collapsed by default (mirrors the Custom Blocks gallery). Expanding
 * mounts the insight card in all four layout variants side by side and shows the
 * example payload with a copy button.
 */
function WidgetSection({
  Component,
  row,
}: {
  Component: RemoteBlockModule['Component']
  row: WidgetRow
}) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const source = JSON.stringify(row.data, null, 2)

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-white/[0.03]"
      >
        <ChevronRight
          className={`size-4 shrink-0 text-white/40 transition-transform ${open ? 'rotate-90' : ''}`}
        />
        <span className="min-w-0 flex-1">
          <span className="truncate text-sm font-semibold capitalize text-white/90">
            {row.widget}
          </span>
          <span className="mt-0.5 line-clamp-1 block text-[13px] text-white/55">
            {row.label}
          </span>
        </span>
        <code className="shrink-0 rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-accent-3">
          widget:{row.widget}
        </code>
      </button>

      {open ? (
        <div className="space-y-4 border-t border-white/10 px-4 py-4">
          <div className="flex flex-wrap content-start gap-4">
            {FRAMES.map((f) => (
              <div key={f.variant} className="flex flex-col gap-1.5">
                <div className="text-[11px] font-medium uppercase tracking-wide text-white/40">
                  {f.variant}
                </div>
                <div style={{ width: f.w, height: f.h }} className="shrink-0">
                  <BlockErrorBoundary
                    fallback={
                      <div className="grid h-full w-full place-items-center rounded-2xl border border-white/10 bg-white/[0.03] text-xs text-white/45">
                        {t('docs.bento.renderError')}
                      </div>
                    }
                  >
                    <Component data={{ ...row.data, variant: f.variant }} />
                  </BlockErrorBoundary>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-white/40">
              {t('docs.insightCards.payload')}
            </span>
            <CopyButton value={source} label={t('docs.bento.copyJson')} />
          </div>
          <pre className="no-scrollbar overflow-x-auto rounded-xl border border-white/10 bg-black/30 p-3 text-xs leading-relaxed text-white/80">
            {source}
          </pre>
        </div>
      ) : null}
    </div>
  )
}

/**
 * The Insight Cards tab — a showcase for the mobile AI insight card (the
 * `mobileAiInsight` remote's `insightCard` block). One collapsible row per
 * widget (`categories`, `donut`, `gauge`, `progress`, `countdown`), derived from
 * the remote's `./docs` examples and deduped by widget; expanding a row renders
 * the card in all four layout variants. Loaded directly from the remote (like
 * the Bento playground), so it degrades to a friendly notice if the remote is
 * down. Read-only preview — no editor.
 */
export function InsightGallery() {
  const { t } = useTranslation()
  const state = useInsightCard()

  // One row per widget (first example wins), derived from the remote's docs.
  const rows = useMemo<WidgetRow[]>(() => {
    if (state.status !== 'ready') return []
    const seen = new Set<string>()
    const out: WidgetRow[] = []
    for (const ex of state.docs?.examples ?? []) {
      const data = (ex.data ?? {}) as Record<string, unknown>
      const widget = typeof data.widget === 'string' ? data.widget : 'categories'
      if (seen.has(widget)) continue
      seen.add(widget)
      out.push({ widget, label: ex.label, data })
    }
    return out
  }, [state])

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
    <div className="animate-float-in space-y-6 pb-16">
      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">
          {t('docs.insightCards.heading')}
        </h2>
        <p className="text-sm text-white/55">{t('docs.insightCards.blurb')}</p>
      </section>

      <div className="space-y-2.5">
        {rows.length === 0 ? (
          <p className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-6 text-center text-sm text-white/45">
            {t('docs.insightCards.empty')}
          </p>
        ) : (
          rows.map((row) => (
            <WidgetSection key={row.widget} Component={Component} row={row} />
          ))
        )}
      </div>
    </div>
  )
}
