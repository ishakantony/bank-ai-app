import { useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { Markdown } from '../Markdown'
import { blockDocs, blockFence } from './blockDocs'
import { CopyButton } from './CopyButton'
import { MARKDOWN_SNIPPETS, STARTERS } from './samples'

const PILL =
  'inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[13px] font-medium text-white/80 backdrop-blur transition hover:-translate-y-px hover:border-white/20 hover:bg-white/10 hover:text-white'

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
  const [params] = useSearchParams()
  const taRef = useRef<HTMLTextAreaElement>(null)
  const [value, setValue] = useState(
    () => decodeMd(params.get('md')) ?? STARTERS[0].content,
  )

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
      () => toast('Share link copied to clipboard'),
      () => toast('Couldn’t copy the link'),
    )
  }

  return (
    <div className="animate-float-in space-y-4 pb-16">
      {/* Toolbar: starters + document actions */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-white/40">
          Start from
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
          <CopyButton value={value} label="Copy markdown" />
          <button
            type="button"
            onClick={share}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-white/70 transition hover:border-white/25 hover:bg-white/10 hover:text-white/90"
          >
            <Share2 className="size-3.5" />
            Share
          </button>
        </div>
      </div>

      {/* Insert palette */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-white/40">
          Insert
        </span>
        {Object.entries(blockDocs).map(([name, doc]) => (
          <button
            key={name}
            type="button"
            className={PILL}
            onClick={() => insert(`\n${blockFence(name, doc.example)}\n`)}
          >
            {doc.title}
          </button>
        ))}
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

      {/* Editor + live preview */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col">
          <div className="mb-2 text-xs font-medium uppercase tracking-wide text-white/40">
            Markdown
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
            Preview
          </div>
          <div className="min-h-[28rem] flex-1 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md">
            <Markdown content={value} />
          </div>
        </div>
      </div>
    </div>
  )
}
