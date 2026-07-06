import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { ChatHeader } from '../components/ChatHeader'
import { MessageThread } from '../components/MessageThread'
import { WelcomeScreen } from '../components/welcome'
import { BlockOverlayHost } from '../components/blocks/BlockOverlayHost'
import { useChatStore } from '../store/chatStore'
import type { ThreadId, TopicId } from '@bank-poc/shared'

const TOPIC_IDS: TopicId[] = [
  'transfer',
  'cards',
  'savings',
  'security',
  'insights',
]

function isTopicId(value: string | null): value is TopicId {
  return value !== null && (TOPIC_IDS as string[]).includes(value)
}

export function ChatPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const topicParam = searchParams.get('topic')
  const messageParam = searchParams.get('message')

  const threadId: ThreadId = isTopicId(topicParam) ? topicParam : 'general'

  const messages = useChatStore((s) => s.threads[threadId])
  const pending = useChatStore((s) => s.pending)
  const sendMessage = useChatStore((s) => s.sendMessage)
  const startGeneralFresh = useChatStore((s) => s.startGeneralFresh)

  const [draft, setDraft] = useState('')

  // A ?message= deeplink seeds the thread once, then we strip the param so a
  // refresh resumes the persisted thread instead of re-sending. The general
  // thread resets fresh; any other thread appends + requests a reply.
  const seeded = useRef(false)
  useEffect(() => {
    if (messageParam && !seeded.current) {
      seeded.current = true
      if (threadId === 'general') {
        startGeneralFresh(messageParam)
      } else {
        sendMessage(threadId, messageParam)
      }
      // Strip only ?message= — keep ?topic= so the thread selection survives
      // (clearing it too would flip the view back to the general thread).
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.delete('message')
          return next
        },
        { replace: true },
      )
    }
  }, [messageParam, threadId, startGeneralFresh, sendMessage, setSearchParams])

  function handleSubmit(text: string) {
    sendMessage(threadId, text)
    setDraft('')
  }

  const showWelcome = threadId !== 'general' && messages.length === 0

  return (
    <>
      <AppShell
        header={<ChatHeader threadId={threadId} />}
        value={draft}
        onChange={setDraft}
        onSubmit={handleSubmit}
        inputDisabled={pending === threadId}
        overlay
      >
        {showWelcome ? (
          <div className="flex min-h-full flex-col justify-center">
            <WelcomeScreen
              topicId={threadId as TopicId}
              onSend={(text) => sendMessage(threadId, text)}
            />
          </div>
        ) : (
          <MessageThread threadId={threadId} />
        )}
      </AppShell>

      {/* Renders block overlays (e.g. the wizard drawer) opened via bus signals
          — outside the message DOM so they escape the scroll/chrome context. */}
      <BlockOverlayHost />
    </>
  )
}
