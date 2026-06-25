import { ArrowUpRight, Sparkles } from 'lucide-react'
import { useChatStore } from '../../store/chatStore'
import { useBlockBus } from '../../store/blockBus'
import { useChatThread } from './ChatThreadContext'
import type { SuggestionItem, SuggestionsData } from './schemas'

/** Shared glassmorphism pill look — identical for prompts, links and signals. */
const PILL =
  'inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[13px] font-medium text-white/80 backdrop-blur transition hover:-translate-y-px hover:border-white/20 hover:bg-white/10 hover:text-white'

/**
 * Follow-up suggestion pills rendered beneath a finished assistant reply
 * (hoisted out of the markdown by `MessageBubble`). A `prompt` pill sends its
 * text back into the current thread; a `link` pill opens a URL; a `signal` pill
 * fires a block-bus intent at another block (e.g. reopening the wizard drawer).
 */
export default function Suggestions({ data }: { data: SuggestionsData }) {
  const threadId = useChatThread()
  const sendMessage = useChatStore((s) => s.sendMessage)
  const signal = useBlockBus((s) => s.signal)

  return (
    <div className="mt-2.5 flex flex-wrap gap-2">
      {data.items.map((item, i) => (
        <SuggestionPill
          key={i}
          item={item}
          onPrompt={(text) => threadId && sendMessage(threadId, text)}
          onSignal={(target, name, payload) => signal(target, name, payload)}
        />
      ))}
    </div>
  )
}

function SuggestionPill({
  item,
  onPrompt,
  onSignal,
}: {
  item: SuggestionItem
  onPrompt: (text: string) => void
  onSignal: (target: string, name: string, payload?: unknown) => void
}) {
  if (item.kind === 'link') {
    return (
      <a href={item.url} target="_blank" rel="noopener noreferrer" className={PILL}>
        <ArrowUpRight className="size-3.5 shrink-0 text-white/50" />
        {item.label}
      </a>
    )
  }

  if (item.kind === 'signal') {
    return (
      <button
        type="button"
        onClick={() => onSignal(item.target, item.name, item.payload)}
        className={PILL}
      >
        <Sparkles className="size-3.5 shrink-0 text-accent-3" />
        {item.label}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={() => onPrompt(item.send ?? item.label)}
      className={PILL}
    >
      <ArrowUpRight className="size-3.5 shrink-0 text-white/50" />
      {item.label}
    </button>
  )
}
