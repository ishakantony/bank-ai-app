import { isValidElement } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { CustomBlock } from './blocks/CustomBlock'

/** Custom blocks are authored as ```bank:<name>``` fenced code. */
const BANK_FENCE = /language-bank:([\w-]+)/

/**
 * Renders assistant message content as rich markdown (GFM: tables, task lists,
 * strikethrough, autolinks). Each element is styled inline with Tailwind to fit
 * the dark, narrow chat column. Raw HTML in the markdown is ignored (safe by
 * default — no rehype-raw), so untrusted content can't inject markup.
 */
const components: Components = {
  h1: ({ children }) => (
    <h1 className="mb-1 mt-3 text-lg font-semibold text-white first:mt-0">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-1 mt-3 text-base font-semibold text-white first:mt-0">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-1 mt-2.5 text-sm font-semibold text-white/95 first:mt-0">{children}</h3>
  ),
  p: ({ children }) => <p className="my-1.5 first:mt-0 last:mb-0">{children}</p>,
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-accent-3 underline-offset-2 hover:underline"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => (
    <ul className="my-1.5 list-disc space-y-1 pl-5 marker:text-white/40">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-1.5 list-decimal space-y-1 pl-5 marker:text-white/40">{children}</ol>
  ),
  li: ({ children }) => <li className="pl-0.5">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  blockquote: ({ children }) => (
    <blockquote className="my-2 border-l-2 border-accent-2/60 pl-3 italic text-white/70">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-3 border-white/10" />,
  table: ({ children }) => (
    <div className="my-2 overflow-x-auto">
      <table className="w-full border-collapse text-[13px]">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-white/10 bg-white/5 px-2.5 py-1.5 text-left font-semibold text-white/90">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-white/10 px-2.5 py-1.5 text-white/80">{children}</td>
  ),
  input: ({ checked }) => (
    <input
      type="checkbox"
      checked={checked}
      readOnly
      className="mr-1.5 translate-y-px accent-accent-2"
    />
  ),
  img: ({ src, alt }) => (
    <img src={typeof src === 'string' ? src : undefined} alt={alt} className="my-2 max-w-full rounded-lg" />
  ),
  pre: ({ children }) => {
    // A bank: fence renders a custom component (handled in `code`); skip the
    // styled code-box wrapper so it isn't boxed like a regular code block.
    if (
      isValidElement<{ className?: string }>(children) &&
      BANK_FENCE.test(children.props.className ?? '')
    ) {
      return <>{children}</>
    }
    return (
      <pre className="my-2 overflow-x-auto rounded-xl border border-white/10 bg-black/30 p-3 text-[13px] leading-relaxed text-white/90">
        {children}
      </pre>
    )
  },
  code: ({ className, children }) => {
    const bank = BANK_FENCE.exec(className ?? '')
    if (bank) {
      return <CustomBlock name={bank[1]} raw={String(children)} />
    }
    const text = String(children)
    const isBlock = /language-(\w+)/.test(className ?? '') || text.includes('\n')
    if (isBlock) {
      return <code className="font-mono">{children}</code>
    }
    return (
      <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[0.9em] text-accent-3">
        {children}
      </code>
    )
  },
}

export function Markdown({ content }: { content: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {content}
    </ReactMarkdown>
  )
}
