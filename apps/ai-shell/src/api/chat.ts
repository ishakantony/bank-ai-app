import type { Role, ThreadId } from '@bank-poc/shared'

/** A single conversation turn sent to the backend (client-only fields stripped). */
export interface ChatTurn {
  role: Role
  content: string
}

export interface SendChatRequest {
  threadId: ThreadId
  /** Full thread history so the LLM has multi-turn context. */
  messages: ChatTurn[]
}

export interface SendChatResponse {
  reply: string
}

export async function sendChat(
  body: SendChatRequest,
): Promise<SendChatResponse> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error(`Failed to send message (${res.status})`)
  }
  return (await res.json()) as SendChatResponse
}
