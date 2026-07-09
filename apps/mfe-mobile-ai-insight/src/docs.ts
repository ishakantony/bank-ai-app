import type { BlockDoc } from '@bank-poc/blocks-kit'

/**
 * Docs for the mobile AI insight cards, exposed via Module Federation (the
 * `./docs` expose) in the same convention as the AI block remotes. The remote
 * owns its own documentation alongside its schema + component. Keyed by block
 * name (the id the carousel feed references).
 */
const docs: Record<string, BlockDoc> = {
  insightCard: {
    title: 'AI insight card',
    summary:
      'An AI insight card for the mobile home carousel. The payload is `{ variant, preset, data }`: `variant` picks the slot size — `hero` (full-bleed slide), `wide`/`tall` (bento lead cell), `compact` (single bento cell) — while `preset` picks the inner visualization: `categories` (ranked bars, the default), `donut`, `gauge`, `progress`, or `countdown`. `data` is the opaque per-preset payload, validated inside the card against the matched preset — an unknown preset or bad data degrades to a default fallback card rather than crashing. Every preset shares the deep-blue chrome: a period eyebrow, a fading headline (hidden on `compact`), an optional delta badge, and a "Full Insight ✨" deep-link. Tapping deep-links into the Bank AI chat: `topic` opens a specific thread (e.g. "insights"), `prompt` seeds the first message, and with neither it opens a plain regular chat.',
    category: 'spending',
    keywords: [
      'ai', 'insight', 'spend', 'carousel', 'mobile', 'bento', 'banner',
      'categories', 'bar', 'donut', 'gauge', 'progress', 'countdown', 'preset',
    ],
    examples: [
      {
        label: 'Categories bars (default)',
        data: {
          variant: 'hero',
          preset: 'categories',
          data: {
            period: 'June',
            headline:
              'Dining and Raya travel led your spend — up sharply on your 6-month rhythm.',
            amount: 6800,
            currency: 'RM',
            delta: '+45% vs 6-mo avg',
            deltaTone: 'warning',
            cta: 'Full Insight',
            topic: 'insights',
            prompt: 'Break down my June spending and why it jumped 45%',
            categories: [
              { label: 'Dining', amount: 2450 },
              { label: 'Travel', amount: 1980 },
              { label: 'Shopping', amount: 1420 },
              { label: 'Groceries', amount: 950 },
            ],
          },
        },
      },
      {
        label: 'Donut (category mix)',
        data: {
          variant: 'hero',
          preset: 'donut',
          data: {
            period: 'June',
            headline: 'Where your RM6,800 went this month, by category.',
            amount: 6800,
            currency: 'RM',
            delta: '4 categories',
            deltaTone: 'info',
            topic: 'insights',
            prompt: 'Show my June spending split by category',
            slices: [
              { label: 'Dining', value: 2450 },
              { label: 'Travel', value: 1980 },
              { label: 'Shopping', value: 1420 },
              { label: 'Groceries', value: 950 },
            ],
          },
        },
      },
      {
        label: 'Gauge (savings rate)',
        data: {
          variant: 'tall',
          preset: 'gauge',
          data: {
            period: 'June',
            headline: 'Your savings rate is on track for a healthy month.',
            value: 32,
            max: 100,
            unit: '%',
            label: 'On track',
            delta: '+6 pts',
            deltaTone: 'positive',
            topic: 'insights',
            prompt: 'How is my savings rate trending this year?',
          },
        },
      },
      {
        label: 'Progress (goal)',
        data: {
          variant: 'wide',
          preset: 'progress',
          data: {
            period: 'Emergency fund',
            headline: 'You are most of the way to a 6-month emergency fund.',
            value: 8200,
            max: 10000,
            label: 'Emergency fund',
            valueLabel: 'RM8,200 of RM10,000',
            delta: 'On track',
            deltaTone: 'positive',
            topic: 'insights',
            prompt: 'How close am I to my emergency-fund goal?',
          },
        },
      },
      {
        label: 'Countdown (card payment)',
        data: {
          variant: 'compact',
          preset: 'countdown',
          data: {
            period: 'Cards',
            headline: 'Your Platinum-i statement is due soon.',
            month: 'Jul',
            day: 25,
            count: 6,
            unit: 'days',
            caption: 'until your card payment',
            delta: 'RM6,200 due',
            deltaTone: 'warning',
            topic: 'insights',
            prompt: 'When is my credit card payment due and how much?',
          },
        },
      },
    ],
  },
}

export default docs
