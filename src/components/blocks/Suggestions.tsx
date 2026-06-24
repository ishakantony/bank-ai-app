import { ArrowUpRight } from 'lucide-react'
import { useChatStore } from '../../store/chatStore'
import { useChatThread } from './ChatThreadContext'
import type { SuggestionItem, SuggestionsData } from './schemas'

/** Shared glassmorphism pill look — identical for prompts and links. */
const PILL =
  'inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[13px] font-medium text-white/80 backdrop-blur transition hover:-translate-y-px hover:border-white/20 hover:bg-white/10 hover:text-white'

/**
 * Follow-up suggestion pills rendered beneath a finished assistant reply
 * (hoisted out of the markdown by `MessageBubble`). A `prompt` pill sends its
 * text back into the current thread; a `link` pill opens a URL in a new tab.
 */
export default function Suggestions({ data }: { data: SuggestionsData }) {
  const threadId = useChatThread()
  const sendMessage = useChatStore((s) => s.sendMessage)

  return (
    <div className="mt-2.5 flex flex-wrap gap-2">
      {data.items.map((item, i) => (
        <SuggestionPill
          key={i}
          item={item}
          onPrompt={(text) => threadId && sendMessage(threadId, text)}
        />
      ))}
    </div>
  )
}

function SuggestionPill({
  item,
  onPrompt,
}: {
  item: SuggestionItem
  onPrompt: (text: string) => void
}) {
  if (item.kind === 'link') {
    return (
      <a href={item.url} target="_blank" rel="noopener noreferrer" className={PILL}>
        <ArrowUpRight className="size-3.5 shrink-0 text-white/50" />
        {item.label}
      </a>
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
