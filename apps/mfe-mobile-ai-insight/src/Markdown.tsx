import type { ReactNode } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkDirective from 'remark-directive'
import { visit } from 'unist-util-visit'
import type { Node } from 'unist'
import { Highlight } from './Highlight'

/**
 * A trimmed fork of the AI shell's `Markdown` for the mobile insight card. It
 * renders the card's `introText` prose with GFM (tables, task lists, autolinks)
 * plus our inline `:hl[…]{tone=…}` highlight directive. Unlike the shell's copy
 * it has **no** `bank:` custom-block fence handling (the card body is a widget,
 * not embedded blocks) and its `components` map is tuned small for the card:
 * tighter spacing, smaller text, white/85 prose on the deep-blue surface.
 *
 * Raw HTML is ignored (no rehype-raw), so `introText` can't inject markup.
 */

/**
 * Authoring contract for inline highlights:
 *
 *   Dining led at :hl[SGD 6,800]{tone=positive} this month.
 *
 * Syntax is a remark text directive — `:hl[<text>]{tone=<tone>}` — where
 * <tone> is one of: positive | negative | warning | info (see Highlight.tsx).
 * An unknown tone degrades to plain text; a missing tone falls back to `info`.
 */
interface DirectiveNode extends Node {
  name?: string
  attributes?: Record<string, string | null | undefined>
  data?: { hName?: string; hProperties?: Record<string, unknown> }
}

/** Map `:hl[...]{tone=...}` text directives onto a `<hl tone>` hast element. */
function remarkHighlight() {
  return (tree: Node) => {
    visit(tree, (node: Node) => {
      const n = node as DirectiveNode
      if (n.type !== 'textDirective' || n.name !== 'hl') return
      const data = n.data ?? (n.data = {})
      data.hName = 'hl'
      data.hProperties = { tone: n.attributes?.tone ?? '' }
    })
  }
}

/** Compact prose tuned for the small card surface (not the chat column). */
const components: Components = {
  h1: ({ children }) => (
    <h1 className="mb-0.5 mt-2 text-sm font-semibold text-white first:mt-0">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-0.5 mt-2 text-[13px] font-semibold text-white first:mt-0">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-0.5 mt-1.5 text-xs font-semibold text-white/95 first:mt-0">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="my-1 text-[13px] leading-snug text-white/85 first:mt-0 last:mb-0">{children}</p>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-brand-3 underline-offset-2 hover:underline"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => (
    <ul className="my-1 list-disc space-y-0.5 pl-4 text-[13px] leading-snug text-white/85 marker:text-white/40">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="my-1 list-decimal space-y-0.5 pl-4 text-[13px] leading-snug text-white/85 marker:text-white/40">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="pl-0.5">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  blockquote: ({ children }) => (
    <blockquote className="my-1.5 border-l-2 border-brand-3/60 pl-2.5 text-[12px] italic text-white/70">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-2 border-white/10" />,
  code: ({ children }) => (
    <code className="rounded bg-white/10 px-1 py-0.5 font-mono text-[0.85em] text-brand-3">
      {children}
    </code>
  ),
}

// `hl` is a custom element name (not a real HTML tag), so it lives outside the
// typed `components` map and the merge is cast through `unknown`.
const allComponents = {
  ...components,
  hl: ({ tone, children }: { tone?: string; children?: ReactNode }) => (
    <Highlight tone={tone}>{children}</Highlight>
  ),
} as unknown as Components

export function Markdown({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkDirective, remarkHighlight]}
      components={allComponents}
    >
      {content}
    </ReactMarkdown>
  )
}
