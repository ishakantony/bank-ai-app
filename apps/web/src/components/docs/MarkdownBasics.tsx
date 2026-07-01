import { Markdown } from '../Markdown'
import { CopyButton } from './CopyButton'
import { MARKDOWN_BASICS } from './samples'

/**
 * The Markdown Basics tab — a side-by-side source + live preview of the plain
 * GitHub-flavoured markdown affordances a reply can use (headings, lists, task
 * lists, tables) plus the inline `:hl[…]{tone}` highlights. Custom blocks live
 * in their own tab; this is just the prose layer.
 */
export function MarkdownBasics() {
  return (
    <div className="animate-float-in space-y-3 pb-16">
      <section className="space-y-1">
        <h2 className="text-lg font-semibold text-white">Markdown basics</h2>
        <p className="text-sm text-white/55">
          Replies render as GitHub-flavoured markdown — headings, lists, task
          lists, tables, strikethrough and autolinks — with inline{' '}
          <code className="rounded bg-white/10 px-1 py-0.5 font-mono text-xs text-accent-3">
            :hl[…]{'{tone}'}
          </code>{' '}
          highlights on top.
        </p>
      </section>
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
    </div>
  )
}
