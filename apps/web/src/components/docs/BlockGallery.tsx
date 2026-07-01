import { useMemo, useState } from 'react'
import { ChevronRight, Search, TriangleAlert } from 'lucide-react'
import { Markdown } from '../Markdown'
import { blockRegistry } from '../blocks/registry'
import { blockGuides, exampleFence, type BlockDoc } from './blockDocs'
import { useBlockDocs } from './useBlockDocs'
import { CopyButton } from './CopyButton'

interface Entry {
  name: string
  doc?: BlockDoc
}

/** Token-AND match across a block's name, title, summary, category and keywords. */
function matches(entry: Entry, query: string): boolean {
  if (!query) return true
  const haystack = [
    entry.name,
    entry.doc?.title ?? '',
    entry.doc?.summary ?? '',
    entry.doc?.category ?? '',
    ...(entry.doc?.keywords ?? []),
  ]
    .join(' ')
    .toLowerCase()
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((t) => haystack.includes(t))
}

/**
 * One block, collapsed by default. The heavy bits — live preview(s), source, and
 * the optional `guide.md` — render only once expanded, so opening the gallery
 * never mounts every block (and its lazy chunk) at once. Scales to many blocks.
 */
function BlockSection({ name, doc }: Entry) {
  const [open, setOpen] = useState(false)
  const guide = blockGuides[name]

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
          <span className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-white/90">
              {doc?.title ?? name}
            </span>
            {doc ? (
              <span className="shrink-0 rounded-full bg-white/8 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white/45">
                {doc.category}
              </span>
            ) : null}
          </span>
          {doc ? (
            <span className="mt-0.5 line-clamp-1 block text-[13px] text-white/55">
              {doc.summary}
            </span>
          ) : null}
        </span>
        <code className="shrink-0 rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-accent-3">
          bank:{name}
        </code>
      </button>

      {open ? (
        <div className="space-y-5 border-t border-white/10 px-4 py-4">
          {!doc ? (
            <p className="flex items-center gap-2 text-sm text-white/55">
              <TriangleAlert className="size-4 shrink-0 text-tone-warning" />
              Documentation pending — add a{' '}
              <code className="rounded bg-white/10 px-1 py-0.5 font-mono text-xs text-accent-3">
                docs.ts
              </code>{' '}
              to this block's folder.
            </p>
          ) : (
            doc.examples.map((ex) => {
              const source = exampleFence(name, ex.data)
              return (
                <div key={ex.label} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-wide text-white/40">
                      {ex.label}
                    </span>
                    <CopyButton value={source} label="Copy source" />
                  </div>
                  {ex.caption ? (
                    <p className="text-[13px] text-white/55">{ex.caption}</p>
                  ) : null}
                  <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                    <Markdown content={source} />
                  </div>
                  <pre className="no-scrollbar overflow-x-auto rounded-xl border border-white/10 bg-black/30 p-3 text-xs leading-relaxed text-white/80">
                    {source}
                  </pre>
                </div>
              )
            })
          )}

          {guide ? (
            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <Markdown content={guide} />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

/**
 * The Gallery tab — living documentation. Entries come from the block *registry*
 * (so a newly registered block can't be silently left out) joined to `blockDocs`.
 * A search box + category facets keep it usable as the block count grows, and
 * each block's preview renders lazily on expand.
 */
export function BlockGallery() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string | null>(null)

  const docs = useBlockDocs()
  const entries = useMemo<Entry[]>(
    () => Object.keys(blockRegistry).map((name) => ({ name, doc: docs[name] })),
    [docs],
  )
  const categories = useMemo(
    () =>
      Array.from(
        new Set(entries.map((e) => e.doc?.category).filter(Boolean) as string[]),
      ).sort(),
    [entries],
  )
  const visible = entries.filter(
    (e) => (!category || e.doc?.category === category) && matches(e, query),
  )

  const chip =
    'rounded-full border px-3 py-1 text-[12px] font-medium transition'
  const chipOn = 'border-accent-2/50 bg-accent-2/15 text-white'
  const chipOff =
    'border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white/85'

  return (
    <div className="animate-float-in space-y-6 pb-16">
      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-white">Custom blocks</h2>
        <p className="text-sm text-white/55">
          Embed rich UI in a reply by writing a{' '}
          <code className="rounded bg-white/10 px-1 py-0.5 font-mono text-xs text-accent-3">
            ```bank:&lt;name&gt;
          </code>{' '}
          fenced code block whose body is JSON. Invalid JSON or a schema mismatch
          degrades to a small inline notice. Charts and cards render fully here;
          interactive affordances that need a live conversation —{' '}
          <span className="text-white/70">prompt</span>/
          <span className="text-white/70">signal</span> pills and the wizard
          drawer — are shown as static previews (only{' '}
          <code className="rounded bg-white/10 px-1 py-0.5 font-mono text-xs text-accent-3">
            link
          </code>{' '}
          pills open).
        </p>
      </section>

      {/* Search + category facets */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/35" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search blocks by name, purpose or keyword…"
            className="w-full rounded-xl border border-white/10 bg-black/30 py-2.5 pl-9 pr-3 text-sm text-white/85 outline-none transition placeholder:text-white/35 focus:border-white/25 focus-visible:ring-2 focus-visible:ring-accent-1/40"
          />
        </div>
        {categories.length > 1 ? (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setCategory(null)}
              className={`${chip} ${category === null ? chipOn : chipOff}`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`${chip} ${category === c ? chipOn : chipOff}`}
              >
                {c}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="space-y-2.5">
        {visible.length === 0 ? (
          <p className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-6 text-center text-sm text-white/45">
            No blocks match “{query}”.
          </p>
        ) : (
          visible.map((e) => <BlockSection key={e.name} {...e} />)
        )}
      </div>
    </div>
  )
}
