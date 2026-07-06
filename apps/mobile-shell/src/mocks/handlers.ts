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
    // Team B's AI insight cards. The carousel resolves an AI feed descriptor's
    // `block` id against this list to know which remote to load — so a new AI
    // card ships by adding its id to a remote's `blocks[]` here, zero carousel
    // changes.
    {
      name: 'mobileAiInsight',
      entry: 'http://localhost:9994/remoteEntry.js',
      blocks: ['insightCard'],
    },
  ],
}

// Content for the promo carousel. Owned here (not on /api/dashboard) because the
// carousel is a self-contained federated widget that fetches this itself: the
// federated code runs inside the host page, so its relative fetch('/api/promos')
// resolves against the host origin and is intercepted by this worker.
const promos = {
  // The insight slot is an AI card: the carousel delegates it to Team B's
  // `insightCard` remote (resolved by block id via /api/block-remotes) and
  // passes `data` through opaquely. If that remote is down or the data is bad,
  // the carousel degrades gracefully — swap this for the plain SpendInsight
  // shape (`{ amount, month, deltaPct, blurb, donut }`) for the non-AI path.
  insight: {
    kind: 'ai',
    block: 'insightCard',
    data: {
      period: 'May',
      headline:
        'Raya travel and dining drove your spend — up 45% on your 6-month rhythm.',
      amount: 6800,
      currency: 'RM',
      delta: '+45% vs 6-mo avg',
      deltaTone: 'warning',
      cta: 'Full Insight',
      // Tapping opens the Bank AI chat on the insights topic, seeded with this
      // prompt — a specific insight conversation.
      topic: 'insights',
      prompt: 'Break down my May spending and why it jumped 45%',
      categories: [
        { label: 'Dining', amount: 2450 },
        { label: 'Travel', amount: 1980 },
        { label: 'Shopping', amount: 1420 },
        { label: 'Groceries', amount: 950 },
      ],
    },
  },
  // Six tiles feed the carousel's two bento slides (groups of three). Bento
  // cells can be normal promos OR AI banners (same `{ kind:'ai', block, data }`
  // descriptor as the insight slot) — the carousel delegates the AI ones to the
  // `insightCard` remote opaquely, so a bento mixes promo banners with AI
  // banners. Each AI tile's `data.variant` matches the cell it lands in: the
  // FIRST tile of a slide is the large one (left→row-span-2 tall, top→col-span-2
  // wide); the rest are single `compact` cells.
  promos: [
    // Slide 1 bento (left layout): AI tall lead + two promo tiles.
    {
      id: 'ai-dining',
      kind: 'ai',
      block: 'insightCard',
      data: {
        variant: 'tall',
        period: 'Q2',
        headline: 'Dining is your fastest-growing category this quarter.',
        amount: 2450,
        currency: 'RM',
        delta: '+18%',
        deltaTone: 'warning',
        topic: 'insights',
        prompt: 'Why is my dining spend growing this quarter?',
        categories: [
          { label: 'Dining', amount: 2450 },
          { label: 'Shopping', amount: 1420 },
          { label: 'Transport', amount: 980 },
        ],
      },
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
      id: 'news',
      kind: 'news',
      eyebrow: '15 Nov 2024 · Market News',
      title: 'Ringgit firms as BNM holds OPR at 3.00%',
      thumb: '📰',
    },
    // Slide 2 bento (top layout): AI wide lead + a promo tile + AI compact.
    {
      id: 'ai-cashflow',
      kind: 'ai',
      block: 'insightCard',
      data: {
        variant: 'wide',
        period: 'This week',
        headline: 'Spending is tracking below your weekly budget — nice one.',
        amount: 820,
        currency: 'RM',
        delta: '−12% vs budget',
        deltaTone: 'positive',
        topic: 'insights',
        prompt: 'How am I tracking against my weekly budget?',
        categories: [
          { label: 'Groceries', amount: 360 },
          { label: 'Transport', amount: 260 },
          { label: 'Dining', amount: 200 },
        ],
      },
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
      id: 'ai-subs',
      kind: 'ai',
      block: 'insightCard',
      data: {
        variant: 'compact',
        period: 'Subscriptions',
        headline: 'Three active subscriptions renew this month.',
        amount: 189,
        currency: 'RM',
        delta: '3 active',
        deltaTone: 'info',
        // No `topic` — this one opens a plain regular chat (seeded with the
        // prompt) rather than a specific insight thread.
        prompt: 'What subscriptions do I have renewing this month?',
        categories: [
          { label: 'Streaming', amount: 89 },
          { label: 'Cloud', amount: 60 },
          { label: 'Fitness', amount: 40 },
        ],
      },
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
  greetingName: 'Ishak',
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
