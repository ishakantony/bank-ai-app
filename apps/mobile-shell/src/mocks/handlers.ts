import { http, HttpResponse, delay } from 'msw'
import type { BlockRemoteManifest } from '@bank-poc/shared'
import type { AuthSession, DashboardData } from '../types'

// The federated-widget manifest the shell registers at boot. The promo carousel
// is a self-fetching remote widget (mounted by RemoteWidget on the home page);
// it owns its own `/api/promos` data, so the shell knows nothing about it beyond
// where to load it from. There's no real backend for the shell — mirror this
// shape on the Hono server if one is added later.
const blockRemotes: BlockRemoteManifest = {
  remotes: [
    {
      name: 'promoCarousel',
      entry: 'http://localhost:9995/remoteEntry.js',
      blocks: ['promoCarousel'],
    },
  ],
}

// Content for the promo carousel. Owned here (not on /api/dashboard) because the
// carousel is a self-contained federated widget that fetches this itself: the
// federated code runs inside the host page, so its relative fetch('/api/promos')
// resolves against the host origin and is intercepted by this worker.
const promos = {
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
  // Six promos feed the carousel's two bento slides (groups of three).
  promos: [
    {
      id: 'asb',
      kind: 'offer',
      eyebrow: 'Wealth',
      title: 'Top up ASB before month-end for bonus units 📈',
      thumb: '📈',
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
      id: 'petrol',
      kind: 'offer',
      eyebrow: 'Cards',
      title: 'cashback on petrol & groceries',
      highlight: '5%',
      thumb: '⛽',
    },
    {
      id: 'news',
      kind: 'news',
      eyebrow: '15 Nov 2024 · Market News',
      title: 'Ringgit firms as BNM holds OPR at 3.00%',
      thumb: '📰',
    },
    {
      id: 'fd',
      kind: 'offer',
      eyebrow: 'Fixed Deposit',
      title: 'p.a. on a 12-month FD-i, locked in today',
      highlight: '4.10%',
      thumb: '🏦',
    },
    {
      id: 'travel',
      kind: 'offer',
      eyebrow: 'Protection',
      title: 'Travel cover from RM9 per trip ✈️',
      thumb: '✈️',
    },
  ],
}

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
  quickActions: [
    { id: 'duitnow', label: 'DuitNow', icon: 'duitnow' },
    { id: 'exchange', label: 'Currency Exchange', icon: 'exchange' },
    { id: 'jompay', label: 'JomPAY', icon: 'jompay' },
    { id: 'ai', label: 'Bank AI', icon: 'ai' },
    { id: 'more', label: 'More', icon: 'more' },
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

  // Owned by the promo-carousel remote widget, which fetches this itself.
  http.get('/api/promos', async () => {
    await delay(500)
    return HttpResponse.json(promos)
  }),

  http.get('/api/block-remotes', async () => {
    await delay(150)
    return HttpResponse.json(blockRemotes)
  }),
]
