import { http, HttpResponse, delay } from 'msw'
import type { BlockRemoteManifest } from '@bank-ai/shared'
import type { AuthSession, DashboardData } from '../types'

// No block remotes are wired for the shell yet — an empty manifest still
// exercises the boot-time registration path (main.tsx → registerRemoteBlocks),
// so adding a remote MFE later is a backend-only change. Mirror the Hono
// server's shape when that lands.
const blockRemotes: BlockRemoteManifest = { remotes: [] }

// The single mock password that "works" — anything else 401s so the error
// toast is demonstrable. Register accepts any input.
const DEMO_PASSWORD = 'password'

function fakeToken(): string {
  return `tok_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`
}

/** Derive a friendly display name from an email local-part, capitalized. */
function nameFromEmail(email: string): string {
  const local = email.split('@')[0]?.replace(/[._-]+/g, ' ').trim() || 'there'
  return local
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

const dashboard: DashboardData = {
  greetingName: 'Aisyah',
  insight: {
    amount: 6800,
    month: 'May',
    deltaPct: 45,
    blurb:
      'a 45% increase compared to your 6-month historical average. Your Raya travel and dining drove most of it.',
    donut: [
      { label: 'Dining', value: 2450 },
      { label: 'Travel', value: 1980 },
      { label: 'Shopping', value: 1420 },
      { label: 'Groceries', value: 950 },
    ],
  },
  quickActions: [
    { id: 'duitnow', label: 'DuitNow', icon: 'duitnow' },
    { id: 'exchange', label: 'Currency Exchange', icon: 'exchange' },
    { id: 'jompay', label: 'JomPAY', icon: 'jompay' },
    { id: 'ai', label: 'Bank AI', icon: 'ai' },
    { id: 'more', label: 'More', icon: 'more' },
  ],
  promos: [
    {
      id: 'news',
      kind: 'news',
      eyebrow: '15 Nov 2024 · Market News',
      title: 'Ringgit firms as BNM holds OPR at 3.00%',
      thumb: '📰',
    },
    {
      id: 'foodie',
      kind: 'offer',
      eyebrow: 'Foodie Fridays',
      title: 'off at 2,000+ local eateries 😋',
      highlight: '8%',
      thumb: '🍜',
    },
    {
      id: 'asb',
      kind: 'offer',
      eyebrow: 'Wealth',
      title: 'Top up ASB before month-end for bonus units',
      thumb: '📈',
    },
  ],
  totalAssets: 95300,
  accounts: [
    {
      id: 'deposits',
      name: 'Deposits',
      icon: 'deposits',
      balance: 60000,
      badge: 'Earned RM100',
      children: [
        { name: 'Everyday Savings-i', detail: 'x8842', balance: 24500 },
        { name: 'Fixed Deposit-i', detail: '12-month · 3.85%', balance: 35500 },
      ],
    },
    {
      id: 'investments',
      name: 'Investments',
      icon: 'investments',
      balance: 35300,
      children: [
        { name: 'ASB / ASNB', detail: 'Units', balance: 21800 },
        { name: 'Unit Trust', detail: 'Balanced fund', balance: 9500 },
        { name: 'PRS', detail: 'Retirement · tax relief', balance: 4000 },
      ],
    },
    {
      id: 'cards',
      name: 'Credit Cards',
      icon: 'cards',
      balance: 8500,
      children: [
        { name: 'Platinum-i', detail: 'x4471 · due 25/07', balance: 6200 },
        { name: 'Cashback-i', detail: 'x1190 · due 18/07', balance: 2300 },
      ],
    },
    {
      id: 'loans',
      name: 'Loans & Borrow',
      icon: 'loans',
      balance: 5000,
      children: [
        { name: 'Personal Financing-i', detail: '24 months left', balance: 5000 },
      ],
    },
  ],
}

export const handlers = [
  http.post('/api/auth/login', async ({ request }) => {
    const { email, password } = (await request.json()) as {
      email: string
      password: string
    }
    await delay(500)
    if (password !== DEMO_PASSWORD) {
      return HttpResponse.json(
        { message: 'Incorrect email or password. Try password “password”.' },
        { status: 401 },
      )
    }
    const session: AuthSession = {
      token: fakeToken(),
      user: { name: nameFromEmail(email), email },
    }
    return HttpResponse.json(session)
  }),

  http.post('/api/auth/register', async ({ request }) => {
    const { name, email } = (await request.json()) as {
      name: string
      email: string
      password: string
    }
    await delay(600)
    const session: AuthSession = {
      token: fakeToken(),
      user: { name: name.trim() || nameFromEmail(email), email },
    }
    return HttpResponse.json(session)
  }),

  http.get('/api/dashboard', async () => {
    await delay(500)
    return HttpResponse.json(dashboard)
  }),

  http.get('/api/block-remotes', async () => {
    await delay(150)
    return HttpResponse.json(blockRemotes)
  }),
]
