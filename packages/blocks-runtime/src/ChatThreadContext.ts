import { createContext, useContext } from 'react'
import type { ThreadId } from '@bank-poc/shared'

/**
 * The thread a message belongs to, provided by `MessageThread`. Lets a block
 * (e.g. the `suggestions` pills or the `wizard` card) dispatch back into the
 * right thread without threading props through the generic `CustomBlock`
 * renderer (whose contract is `{ data }` only).
 *
 * Lives in `@bank-poc/blocks-runtime` (a Module Federation shared singleton) so
 * the context identity is the same for the host and every block remote.
 */
const ChatThreadContext = createContext<ThreadId | null>(null)

export const ChatThreadProvider = ChatThreadContext.Provider

export function useChatThread(): ThreadId | null {
  return useContext(ChatThreadContext)
}
