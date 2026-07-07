import OpenAI from 'openai'
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions'
import { DEFAULT_LOCALE, type Locale, type ThreadId } from '@bank-poc/shared'
import { buildSystemPrompt } from './prompt.ts'

/** A single turn of conversation history sent by the client. */
export interface ChatTurn {
  role: 'user' | 'assistant'
  content: string
}

let client: OpenAI | null = null

/**
 * Lazily construct the OpenAI client pointed at OpenRouter. Lazy so the
 * static endpoints (topics/insights) work even without an API key configured;
 * a missing key only surfaces when a chat is actually requested.
 */
function getClient(): OpenAI {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is not set')
  client ??= new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey,
    timeout: 30_000,
    // OpenRouter ranking headers (optional but recommended).
    defaultHeaders: {
      'HTTP-Referer': 'http://localhost:9999',
      'X-Title': 'Bank AI',
    },
  })
  return client
}

/**
 * Generate a full assistant reply for the thread. The model emits one Markdown
 * string (which may embed `bank:<name>` blocks); we return it whole and the
 * frontend fakes streaming. Throws on any failure so the route returns 5xx and
 * the frontend's error + retry UX kicks in.
 */
export async function generateReply(
  threadId: ThreadId,
  messages: ChatTurn[],
  locale: Locale = DEFAULT_LOCALE,
): Promise<string> {
  const model = process.env.OPENROUTER_MODEL
  if (!model) throw new Error('OPENROUTER_MODEL is not set')

  const payload: ChatCompletionMessageParam[] = [
    { role: 'system', content: buildSystemPrompt(threadId, locale) },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ]

  const completion = await getClient().chat.completions.create({
    model,
    messages: payload,
  })

  const reply = completion.choices[0]?.message?.content
  if (!reply) throw new Error('OpenRouter returned an empty reply')
  return reply
}
