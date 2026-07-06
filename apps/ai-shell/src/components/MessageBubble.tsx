import { useEffect, useMemo } from 'react'
import { RotateCw } from 'lucide-react'
import { useChatStore } from '../store/chatStore'
import { useTypewriter } from '../hooks/useTypewriter'
import { Markdown } from './Markdown'
import { MessageActions } from './MessageActions'
import { CustomBlock } from './blocks/CustomBlock'
import { splitSuggestions } from './blocks/suggestions/splitSuggestions'
import type { Message, ThreadId } from '@bank-poc/shared'

interface MessageBubbleProps {
  message: Message
  threadId: ThreadId
  /** Whether this is the last message in the thread (gates the suggestion pills). */
  isLast?: boolean
  /** Called as the bubble's content reveals, so the thread can keep scrolled. */
  onReveal?: () => void
}

export function MessageBubble({ message, threadId, isLast, onReveal }: MessageBubbleProps) {
  const retryLast = useChatStore((s) => s.retryLast)
  const finishStreaming = useChatStore((s) => s.finishStreaming)

  // Hoist the suggestions block out of the prose: it renders below the actions,
  // never inline. Stripping it before the typewriter also keeps its raw JSON
  // from ever flashing on screen.
  const { prose, raw: suggestions } = useMemo(
    () => splitSuggestions(message.content),
    [message.content],
  )

  const streaming = message.role === 'assistant' && message.status === 'streaming'
  const visible = useTypewriter(prose, streaming, () =>
    finishStreaming(threadId, message.id),
  )

  useEffect(() => {
    onReveal?.()
  }, [visible, onReveal])

  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-gradient-to-br from-accent-1 to-accent-2 px-3.5 py-2.5 text-[15px] leading-relaxed text-white shadow-lg">
          {message.content}
        </div>
      </div>
    )
  }

  if (message.status === 'error') {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3.5 py-3 text-sm text-white/60">
        <span>Something went wrong sending that.</span>
        <button
          type="button"
          onClick={() => retryLast(threadId)}
          className="inline-flex items-center gap-1 font-medium text-accent-3 underline-offset-2 hover:underline"
        >
          <RotateCw className="size-3.5" />
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="break-words text-[15px] leading-relaxed text-white/90">
      <Markdown content={visible} />
      {streaming ? (
        <span className="ml-0.5 inline-block h-4 w-px translate-y-0.5 animate-pulse bg-white/70" />
      ) : message.content ? (
        <>
          <MessageActions
            content={message.content}
            threadId={threadId}
            messageId={message.id}
            canRegenerate={!!isLast}
          />
          {isLast && suggestions ? (
            <CustomBlock name="suggestions" raw={suggestions} />
          ) : null}
        </>
      ) : null}
    </div>
  )
}
