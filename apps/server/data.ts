import type { Insight, Topic } from '@bank-poc/shared'

/**
 * Static seed data served by the real backend. This is intentionally a separate
 * copy from the MSW mock (`src/mocks/handlers.ts`): the mock and the real Hono
 * server are two independent backends, and these topic/insight cards are static
 * content that doesn't need a single source of truth across them.
 */

export const topics: Topic[] = [
  {
    id: 'transfer',
    name: 'Transfer Money',
    description: 'Send funds to anyone, instantly and securely.',
    icon: 'transfer',
  },
  {
    id: 'cards',
    name: 'Card Services',
    description: 'Freeze, replace or manage your cards.',
    icon: 'card',
  },
  {
    id: 'savings',
    name: 'Savings & Goals',
    description: 'Track your goals and grow your savings.',
    icon: 'savings',
  },
  {
    id: 'security',
    name: 'Fraud & Security',
    description: 'Report suspicious activity and stay protected.',
    icon: 'security',
  },
  {
    id: 'insights',
    name: 'Insights',
    description: 'Personalized tips to make the most of your money.',
    icon: 'insights',
  },
]

export const insights: Insight[] = [
  {
    id: 'portfolio',
    title: 'Your investment portfolio needs rebalancing',
    description: 'Your allocation has drifted from your target. Tap to review.',
    icon: 'portfolio',
    tone: 'amber',
  },
  {
    id: 'spending',
    title: 'Spending this month',
    description: "You've spent RM2,140 — 18% more than last month.",
    icon: 'spending',
    tone: 'blue',
  },
  {
    id: 'idleCash',
    title: 'Idle cash',
    description: 'RM8,500 sitting in checking could be earning more.',
    icon: 'idleCash',
    tone: 'green',
  },
]
