import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import {
  DEFAULT_LOCALE,
  LOCALES,
  type BlockRemoteManifest,
  type Locale,
  type ThreadId,
} from '@bank-poc/shared'
import { insights, topics } from './data.ts'
import { generateReply, type ChatTurn } from './openrouter.ts'

const app = new Hono()

/** Pick the request's locale from `Accept-Language`, defaulting to English. */
function resolveLocale(acceptLanguage: string | undefined): Locale {
  const raw = acceptLanguage?.split(',')[0]?.split('-')[0]
  return LOCALES.includes(raw as Locale) ? (raw as Locale) : DEFAULT_LOCALE
}

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

app.get('/api/topics', (c) => c.json(topics[resolveLocale(c.req.header('Accept-Language'))]))
app.get('/api/insights', (c) => c.json(insights[resolveLocale(c.req.header('Accept-Language'))]))
app.get('/api/block-remotes', (c) => c.json(blockRemotes))

app.post('/api/chat', async (c) => {
  const locale = resolveLocale(c.req.header('Accept-Language'))
  const body = await c.req.json<{ threadId?: ThreadId; messages?: ChatTurn[] }>()
  const threadId: ThreadId = body.threadId ?? 'general'
  const messages = body.messages ?? []
  try {
    const reply = await generateReply(threadId, messages, locale)
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
