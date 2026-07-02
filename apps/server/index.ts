import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import type { BlockRemoteManifest, ThreadId } from '@bank-ai/shared'
import { insights, topics } from './data.ts'
import { generateReply, type ChatTurn } from './openrouter.ts'

const app = new Hono()

// Which block remotes exist and where to load them from. The URL is
// env-configurable (default: the local dev remote) so the same server can point
// the host at a CDN in other environments without a host rebuild.
const blockRemotes: BlockRemoteManifest = {
  remotes: [
    {
      name: 'blocksSpend',
      entry:
        process.env.BLOCKS_SPEND_ENTRY ?? 'http://localhost:9998/remoteEntry.js',
      blocks: ['spendTrend', 'spendDonut', 'spendBreakdown'],
    },
    {
      name: 'blocksPortfolio',
      entry:
        process.env.BLOCKS_PORTFOLIO_ENTRY ??
        'http://localhost:9997/remoteEntry.js',
      blocks: ['portfolioValue', 'holdingsTable', 'allocationRing'],
    },
    {
      name: 'blocksWealth',
      entry:
        process.env.BLOCKS_WEALTH_ENTRY ?? 'http://localhost:9996/remoteEntry.js',
      blocks: ['wizard', 'allocationDonut', 'driftBars', 'actionCard'],
    },
  ],
}

app.get('/api/topics', (c) => c.json(topics))
app.get('/api/insights', (c) => c.json(insights))
app.get('/api/block-remotes', (c) => c.json(blockRemotes))

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
