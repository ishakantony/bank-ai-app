import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { sendChat } from '../api/chat'
import type { Message, ThreadId } from '../types'

const EMPTY_THREADS: Record<ThreadId, Message[]> = {
  transfer: [],
  cards: [],
  savings: [],
  security: [],
  insights: [],
  general: [],
}

interface ChatState {
  threads: Record<ThreadId, Message[]>
  /** The thread currently awaiting a reply or streaming one (locks its input). */
  pending: ThreadId | null

  sendMessage: (threadId: ThreadId, text: string) => void
  /** The home input always restarts the general thread from scratch. */
  startGeneralFresh: (text: string) => void
  clearThread: (threadId: ThreadId) => void
  retryLast: (threadId: ThreadId) => void
  /** Called by the typewriter when a streaming reply finishes revealing. */
  finishStreaming: (threadId: ThreadId, messageId: string) => void
}

function newId() {
  return crypto.randomUUID()
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => {
      // Fetch the reply for the thread's latest user message and append it.
      async function requestReply(threadId: ThreadId) {
        set({ pending: threadId })
        const thread = get().threads[threadId]
        const lastUser = [...thread].reverse().find((m) => m.role === 'user')
        if (!lastUser) {
          set({ pending: null })
          return
        }
        try {
          const { reply } = await sendChat({ threadId, message: lastUser.content })
          set((state) => ({
            threads: {
              ...state.threads,
              [threadId]: [
                ...state.threads[threadId],
                {
                  id: newId(),
                  role: 'assistant',
                  content: reply,
                  status: 'streaming',
                },
              ],
            },
            // pending stays set until the typewriter calls finishStreaming.
          }))
        } catch {
          set((state) => ({
            pending: null,
            threads: {
              ...state.threads,
              [threadId]: [
                ...state.threads[threadId],
                { id: newId(), role: 'assistant', content: '', status: 'error' },
              ],
            },
          }))
        }
      }

      return {
        threads: EMPTY_THREADS,
        pending: null,

        sendMessage: (threadId, text) => {
          const trimmed = text.trim()
          if (!trimmed) return
          set((state) => ({
            threads: {
              ...state.threads,
              [threadId]: [
                ...state.threads[threadId],
                { id: newId(), role: 'user', content: trimmed },
              ],
            },
          }))
          void requestReply(threadId)
        },

        startGeneralFresh: (text) => {
          const trimmed = text.trim()
          if (!trimmed) return
          set((state) => ({
            threads: {
              ...state.threads,
              general: [{ id: newId(), role: 'user', content: trimmed }],
            },
          }))
          void requestReply('general')
        },

        clearThread: (threadId) =>
          set((state) => ({
            pending: state.pending === threadId ? null : state.pending,
            threads: { ...state.threads, [threadId]: [] },
          })),

        retryLast: (threadId) => {
          set((state) => {
            const thread = state.threads[threadId]
            const last = thread[thread.length - 1]
            if (!last || last.status !== 'error') return state
            return {
              threads: { ...state.threads, [threadId]: thread.slice(0, -1) },
            }
          })
          void requestReply(threadId)
        },

        finishStreaming: (threadId, messageId) =>
          set((state) => ({
            pending: state.pending === threadId ? null : state.pending,
            threads: {
              ...state.threads,
              [threadId]: state.threads[threadId].map((m) =>
                m.id === messageId ? { ...m, status: undefined } : m,
              ),
            },
          })),
      }
    },
    {
      name: 'bank-ai-chat',
      storage: createJSONStorage(() => sessionStorage),
      // Only persist the conversation. `pending` is transient; and any message
      // left mid-stream is normalized to "done" so it renders fully on reload.
      partialize: (state) => ({
        threads: Object.fromEntries(
          Object.entries(state.threads).map(([id, msgs]) => [
            id,
            msgs.map((m) =>
              m.status === 'streaming' ? { ...m, status: undefined } : m,
            ),
          ]),
        ) as Record<ThreadId, Message[]>,
      }),
    },
  ),
)
