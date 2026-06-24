import type { ThreadId } from '../types'

export interface SendChatRequest {
  threadId: ThreadId
  message: string
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
