import { TriangleAlert } from 'lucide-react'
import { Markdown } from '../Markdown'
import { BlockCard } from '../blocks/BlockCard'
import { blockRegistry } from '../blocks/registry'
import { blockDocs, blockFence } from './blockDocs'
import { CopyButton } from './CopyButton'
import { MARKDOWN_BASICS } from './samples'

/** One documented block: description, live render, and copyable source. */
function BlockSection({ name }: { name: string }) {
  const doc = blockDocs[name]

  if (!doc) {
    return (
      <BlockCard title={name}>
        <p className="flex items-center gap-2 text-sm text-white/55">
          <TriangleAlert className="size-4 shrink-0 text-tone-warning" />
          Documentation pending — add an entry to{' '}
          <code className="rounded bg-white/10 px-1 py-0.5 font-mono text-xs text-accent-3">
            blockDocs.ts
          </code>
          .
        </p>
      </BlockCard>
    )
  }

  const source = blockFence(name, doc.example)

  return (
    <BlockCard title={doc.title}>
      <p className="mb-3 text-sm text-white/55">{doc.description}</p>

      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-white/40">
          Preview
        </span>
        <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-accent-3">
          bank:{name}
        </code>
      </div>
      <div className="mb-4 rounded-xl border border-white/10 bg-black/20 p-3">
        <Markdown content={source} />
      </div>

      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-white/40">
          Source
        </span>
        <CopyButton value={source} label="Copy source" />
      </div>
      <pre className="no-scrollbar overflow-x-auto rounded-xl border border-white/10 bg-black/30 p-3 text-xs leading-relaxed text-white/80">
        {source}
      </pre>
    </BlockCard>
  )
}

/**
 * The Gallery tab — living documentation. Iterates the block *registry* (so a
 * newly registered block can't be silently left out) and renders each block's
 * docs, plus a section showing the plain-markdown affordances.
 */
export function BlockGallery() {
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
          drawer — are shown as static previews (only <code className="rounded bg-white/10 px-1 py-0.5 font-mono text-xs text-accent-3">link</code> pills open).
        </p>
      </section>

      <div className="space-y-4">
        {Object.keys(blockRegistry).map((name) => (
          <BlockSection key={name} name={name} />
        ))}
      </div>

      <section className="space-y-3 pt-2">
        <div>
          <h2 className="text-lg font-semibold text-white">Markdown basics</h2>
          <p className="text-sm text-white/55">
            Replies also support GitHub-flavoured markdown and inline highlights.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-white/40">
                Source
              </span>
              <CopyButton value={MARKDOWN_BASICS} label="Copy source" />
            </div>
            <pre className="no-scrollbar h-full overflow-x-auto rounded-xl border border-white/10 bg-black/30 p-3 text-xs leading-relaxed text-white/80">
              {MARKDOWN_BASICS}
            </pre>
          </div>
          <div>
            <div className="mb-2 text-xs font-medium uppercase tracking-wide text-white/40">
              Preview
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
              <Markdown content={MARKDOWN_BASICS} />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
