import type { ThreadId } from '@bank-ai/shared'

/**
 * A one-slot indirection for sending a chat message from a block, so a block
 * (local or federated) can post into a thread without importing the host's
 * `chatStore`. The host wires the real sender in once at boot with
 * `setChatSend`; blocks call `sendChatMessage`.
 *
 * Kept in `@bank-ai/blocks-runtime` (a Module Federation shared singleton) so
 * the sender the host registers is the one a remote block invokes.
 */
type ChatSend = (threadId: ThreadId, text: string) => void

let send: ChatSend | null = null

/** Called once by the host to bind the real message sender. */
export function setChatSend(fn: ChatSend): void {
  send = fn
}

/** Post a message into a thread. No-op until the host has wired the sender. */
export function sendChatMessage(threadId: ThreadId, text: string): void {
  send?.(threadId, text)
}
