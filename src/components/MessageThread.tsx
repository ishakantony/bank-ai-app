import { useCallback, useEffect, useRef } from 'react'
import { useChatStore } from '../store/chatStore'
import type { ThreadId } from '../types'
import { MessageBubble } from './MessageBubble'
import { TypingIndicator } from './TypingIndicator'

interface MessageThreadProps {
  threadId: ThreadId
}

export function MessageThread({ threadId }: MessageThreadProps) {
  const messages = useChatStore((s) => s.threads[threadId])
  const pending = useChatStore((s) => s.pending)

  const bottomRef = useRef<HTMLDivElement>(null)
  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [])

  const last = messages[messages.length - 1]
  const showIndicator = pending === threadId && last?.role === 'user'

  useEffect(() => {
    scrollToBottom()
  }, [messages.length, showIndicator, scrollToBottom])

  return (
    <div className="flex flex-col gap-4 py-6">
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          threadId={threadId}
          onReveal={scrollToBottom}
        />
      ))}
      {showIndicator ? <TypingIndicator /> : null}
      <div ref={bottomRef} />
    </div>
  )
}
