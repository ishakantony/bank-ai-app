import { ArrowLeft, SquarePen } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useChatStore } from '../store/chatStore'
import type { ThreadId } from '../types'
import { Orb } from './Orb'

interface ChatHeaderProps {
  threadId: ThreadId
}

/** Slim top bar: back to home, compact brand, and a new-chat reset. */
export function ChatHeader({ threadId }: ChatHeaderProps) {
  const navigate = useNavigate()
  const clearThread = useChatStore((s) => s.clearThread)

  function handleNewChat() {
    clearThread(threadId)
    navigate('/')
  }

  return (
    <header className="flex items-center justify-between py-3">
      <button
        type="button"
        onClick={() => navigate('/')}
        aria-label="Back to home"
        className="grid size-9 place-items-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-1/70"
      >
        <ArrowLeft className="size-5" />
      </button>

      <div className="flex items-center gap-2">
        <Orb size={24} active={false} />
        <span className="bg-gradient-to-r from-accent-1 via-accent-2 to-accent-3 bg-clip-text text-base font-bold tracking-tight text-transparent">
          Bank AI
        </span>
      </div>

      <button
        type="button"
        onClick={handleNewChat}
        aria-label="New chat"
        className="grid size-9 place-items-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-1/70"
      >
        <SquarePen className="size-5" />
      </button>
    </header>
  )
}
