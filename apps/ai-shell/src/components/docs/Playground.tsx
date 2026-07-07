import { useCallback, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Columns2, Search, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { Markdown } from '../Markdown'
import { exampleFence } from './blockDocs'
import { useBlockDocs } from './useBlockDocs'
import { CopyButton } from './CopyButton'
import { MARKDOWN_SNIPPETS, STARTERS } from './samples'

const PILL =
  'inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[13px] font-medium text-white/80 backdrop-blur transition hover:-translate-y-px hover:border-white/20 hover:bg-white/10 hover:text-white'

/** Pill in its active (selected) state — mirrors the docs tab styling. */
const PILL_ACTIVE =
  'inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[13px] font-medium text-white backdrop-blur transition'

type Viewport = { id: string; label: string; w: number; h: number }

/** Device viewport presets (CSS-pixel dimensions). */
const VIEWPORTS: Viewport[] = [
  { id: 'se', label: 'iPhone SE', w: 375, h: 667 },
  { id: 'x', label: 'iPhone X', w: 375, h: 812 },
  { id: '15pm', label: 'iPhone 15 Pro Max', w: 430, h: 932 },
  { id: 'pixel7', label: 'Pixel 7', w: 412, h: 915 },
  { id: 'ipadmini', label: 'iPad Mini', w: 768, h: 1024 },
]

/** Encode editor text into a URL-safe `?md=` value (handles non-ASCII). */
function encodeMd(text: string): string {
  return btoa(encodeURIComponent(text))
}

/** Reverse of `encodeMd`; returns null if the value is malformed. */
function decodeMd(value: string | null): string | null {
  if (!value) return null
  try {
    return decodeURIComponent(atob(value))
  } catch {
    return null
  }
}

/**
 * The Playground tab — a markdown editor with a live preview. Friendly for
 * non-technical authors: an insert palette splices block/markdown snippets at
 * the cursor, starter examples seed full documents, and the current document can
 * be copied or shared via a self-contained URL.
 */
export function Playground() {
  const { t } = useTranslation()
  const [params] = useSearchParams()
  const taRef = useRef<HTMLTextAreaElement>(null)
  const [value, setValue] = useState(
    () => decodeMd(params.get('md')) ?? STARTERS[0].content,
  )
  const [blockQuery, setBlockQuery] = useState('')
  // Preview viewport: null = "Fit" (side-by-side, responsive). Otherwise a
  // preset id or 'custom', which render the preview inside a device frame.
  const [viewportId, setViewportId] = useState<string | null>(null)
  const [customW, setCustomW] = useState(390)
  const [customH, setCustomH] = useState(844)
  // Compare mode: turn the viewport pills into a multi-select and render every
  // selected device side-by-side. `compareIds` is a subset of preset ids plus
  // 'custom', in selection order.
  const [compare, setCompare] = useState(false)
  const [compareIds, setCompareIds] = useState<string[]>([])

  // Resolve a viewport id to concrete dimensions; null if it has no frame.
  const resolveDevice = useCallback(
    (id: string): Viewport | null => {
      if (id === 'custom') return { id: 'custom', label: 'Custom', w: customW, h: customH }
      return VIEWPORTS.find((v) => v.id === id) ?? null
    },
    [customW, customH],
  )

  // The device frames to render. Empty = Fit mode (responsive, no frame).
  const frames = useMemo<Viewport[]>(() => {
    const ids = compare ? compareIds : viewportId === null ? [] : [viewportId]
    return ids.map(resolveDevice).filter((d): d is Viewport => d !== null)
  }, [compare, compareIds, viewportId, resolveDevice])

  // Enable compare; seed the set from the current device so the preview isn't blank.
  function enableCompare() {
    setCompare(true)
    if (compareIds.length === 0) {
      setCompareIds([viewportId ?? 'se'])
    }
  }

  // Toggle a viewport id in/out of the compare set.
  function toggleCompareId(id: string) {
    setCompareIds((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id],
    )
  }

  // Filter the block palette so it stays usable as the block count grows.
  const blockDocs = useBlockDocs()
  const blockEntries = useMemo(() => Object.entries(blockDocs), [blockDocs])
  const filteredBlocks = useMemo(() => {
    const q = blockQuery.toLowerCase().trim()
    if (!q) return blockEntries
    return blockEntries.filter(([name, doc]) => {
      const hay = [name, doc.title, doc.summary, doc.category, ...(doc.keywords ?? [])]
        .join(' ')
        .toLowerCase()
      return q.split(/\s+/).every((t) => hay.includes(t))
    })
  }, [blockEntries, blockQuery])

  /** Splice `snippet` in at the cursor (or replace the selection). */
  function insert(snippet: string) {
    const ta = taRef.current
    if (!ta) {
      setValue((v) => v + snippet)
      return
    }
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const next = value.slice(0, start) + snippet + value.slice(end)
    setValue(next)
    // Restore focus and place the cursor after the inserted snippet.
    requestAnimationFrame(() => {
      ta.focus()
      const pos = start + snippet.length
      ta.setSelectionRange(pos, pos)
    })
  }

  function share() {
    const url = `${window.location.origin}${window.location.pathname}?tab=playground&md=${encodeMd(value)}`
    navigator.clipboard.writeText(url).then(
      () => toast(t('docs.playground.shareCopied')),
      () => toast(t('docs.playground.shareFailed')),
    )
  }

  return (
    <div className="animate-float-in space-y-4 pb-16">
      {/* Toolbar: starters + document actions */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-white/40">
          {t('docs.playground.startFrom')}
        </span>
        {STARTERS.map((s) => (
          <button
            key={s.label}
            type="button"
            className={PILL}
            onClick={() => setValue(s.content)}
          >
            {s.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <CopyButton value={value} label={t('docs.playground.copyMarkdown')} />
          <button
            type="button"
            onClick={share}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-white/70 transition hover:border-white/25 hover:bg-white/10 hover:text-white/90"
          >
            <Share2 className="size-3.5" />
            {t('docs.playground.share')}
          </button>
        </div>
      </div>

      {/* Insert palette */}
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-white/40">
            {t('docs.playground.insertBlock')}
          </span>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-white/35" />
            <input
              type="search"
              value={blockQuery}
              onChange={(e) => setBlockQuery(e.target.value)}
              placeholder={t('docs.playground.filterBlocks')}
              className="w-44 rounded-full border border-white/10 bg-black/30 py-1.5 pl-8 pr-3 text-[13px] text-white/85 outline-none transition placeholder:text-white/35 focus:border-white/25 focus-visible:ring-2 focus-visible:ring-accent-1/40"
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {filteredBlocks.length === 0 ? (
            <span className="text-xs text-white/40">{t('docs.playground.noBlocks')}</span>
          ) : (
            filteredBlocks.map(([name, doc]) => (
              <button
                key={name}
                type="button"
                className={PILL}
                onClick={() =>
                  insert(`\n${exampleFence(name, doc.examples[0].data)}\n`)
                }
              >
                {doc.title}
              </button>
            ))
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-white/40">
            {t('docs.playground.markdown')}
          </span>
          {MARKDOWN_SNIPPETS.map((s) => (
            <button
              key={s.label}
              type="button"
              className={PILL}
              onClick={() => insert(s.snippet)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Viewport presets */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-white/40">
          {t('docs.playground.viewport')}
        </span>
        <button
          type="button"
          className={compare ? PILL_ACTIVE : PILL}
          aria-pressed={compare}
          onClick={() => (compare ? setCompare(false) : enableCompare())}
        >
          <Columns2 className="size-3.5" />
          {t('docs.playground.compare')}
        </button>
        {!compare && (
          <button
            type="button"
            className={viewportId === null ? PILL_ACTIVE : PILL}
            onClick={() => setViewportId(null)}
          >
            {t('docs.playground.fit')}
          </button>
        )}
        {VIEWPORTS.map((v) => {
          const active = compare ? compareIds.includes(v.id) : viewportId === v.id
          return (
            <button
              key={v.id}
              type="button"
              className={active ? PILL_ACTIVE : PILL}
              onClick={() => (compare ? toggleCompareId(v.id) : setViewportId(v.id))}
            >
              {v.label}
            </button>
          )
        })}
        <button
          type="button"
          className={
            (compare ? compareIds.includes('custom') : viewportId === 'custom')
              ? PILL_ACTIVE
              : PILL
          }
          onClick={() => (compare ? toggleCompareId('custom') : setViewportId('custom'))}
        >
          {t('docs.playground.custom')}
        </button>
        {(compare ? compareIds.includes('custom') : viewportId === 'custom') && (
          <div className="flex items-center gap-1.5 text-[13px] text-white/55">
            <input
              type="number"
              min={120}
              value={customW}
              onChange={(e) => setCustomW(Number(e.target.value) || 0)}
              className="w-20 rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-white/85 outline-none transition focus:border-white/25 focus-visible:ring-2 focus-visible:ring-accent-1/40"
            />
            <span aria-hidden>×</span>
            <input
              type="number"
              min={120}
              value={customH}
              onChange={(e) => setCustomH(Number(e.target.value) || 0)}
              className="w-20 rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-white/85 outline-none transition focus:border-white/25 focus-visible:ring-2 focus-visible:ring-accent-1/40"
            />
          </div>
        )}
      </div>

      {/* Editor + live preview */}
      {!compare && viewportId === null ? (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col">
            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-white/40">
              {t('docs.playground.markdown')}
            </div>
            <textarea
              ref={taRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              spellCheck={false}
              className="no-scrollbar min-h-[28rem] w-full flex-1 resize-y rounded-2xl border border-white/10 bg-black/30 p-4 font-mono text-[13px] leading-relaxed text-white/85 outline-none transition focus:border-white/25 focus-visible:ring-2 focus-visible:ring-accent-1/40"
            />
          </div>
          <div className="flex flex-col">
            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-white/40">
              {t('docs.playground.preview')}
            </div>
            <div className="min-h-[28rem] flex-1 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md">
              <Markdown content={value} />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col">
            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-white/40">
              {t('docs.playground.markdown')}
            </div>
            <textarea
              ref={taRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              spellCheck={false}
              className="no-scrollbar min-h-[16rem] w-full resize-y rounded-2xl border border-white/10 bg-black/30 p-4 font-mono text-[13px] leading-relaxed text-white/85 outline-none transition focus:border-white/25 focus-visible:ring-2 focus-visible:ring-accent-1/40"
            />
          </div>
          <div className="flex flex-col">
            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-white/40">
              {compare ? t('docs.playground.comparing', { count: frames.length }) : t('docs.playground.preview')}
            </div>
            {frames.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center text-sm text-white/45">
                {t('docs.playground.selectDevices')}
              </div>
            ) : (
              <div className="overflow-x-auto py-2">
                <div className="mx-auto flex min-w-max gap-4 px-1">
                  {frames.map((d) => (
                    <div key={d.id} className="flex shrink-0 flex-col gap-2">
                      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-white/40">
                        <span>{d.label}</span>
                        <span className="font-mono normal-case text-white/35">
                          {d.w} × {d.h}
                        </span>
                      </div>
                      <div
                        style={{ width: d.w, height: d.h }}
                        className="shrink-0 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] shadow-2xl backdrop-blur-md"
                      >
                        <div className="no-scrollbar h-full overflow-y-auto p-4">
                          <Markdown content={value} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
