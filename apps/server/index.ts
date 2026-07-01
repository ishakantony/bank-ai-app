import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import type { ThreadId } from '@bank-ai/shared'
import { insights, topics } from './data.ts'
import { generateReply, type ChatTurn } from './openrouter.ts'

const app = new Hono()

app.get('/api/topics', (c) => c.json(topics))
app.get('/api/insights', (c) => c.json(insights))

app.post('/api/chat', async (c) => {
  const body = await c.req.json<{ threadId?: ThreadId; messages?: ChatTurn[] }>()
  const threadId: ThreadId = body.threadId ?? 'general'
  const messages = body.messages ?? []
  try {
    const reply = await generateReply(threadId, messages)
    return c.json({ reply })
  } catch (err) {
    // Surface the failure so the frontend shows its error bubble + retry.
    console.error('[chat] failed:', err)
    return c.json({ error: 'chat_failed' }, 502)
  }
})

const port = Number(process.env.PORT ?? 8787)
serve({ fetch: app.fetch, port })
console.log(`Bank AI server listening on http://localhost:${port}`)
