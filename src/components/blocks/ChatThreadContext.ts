import { createContext, useContext } from 'react'
import type { ThreadId } from '../../types'

/**
 * The thread a message belongs to, provided by `MessageThread`. Lets the
 * `suggestions` block dispatch a prompt back into the right thread without
 * threading props through the generic `CustomBlock` renderer (whose contract is
 * `{ data }` only).
 */
const ChatThreadContext = createContext<ThreadId | null>(null)

export const ChatThreadProvider = ChatThreadContext.Provider

export function useChatThread(): ThreadId | null {
  return useContext(ChatThreadContext)
}
