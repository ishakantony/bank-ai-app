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
      'An AI spend-insight card for the mobile home carousel: a headline blurb + hero amount + optional delta badge, above a live category bar chart. `variant` picks the layout so the same card fits any slot — `hero` (full-bleed slide), `wide`/`tall` (bento lead cell), or `compact` (single bento cell) — letting a bento mix normal promo banners with AI banners. Tapping the card deep-links into the Bank AI chat: `topic` opens a specific thread (e.g. "insights"), `prompt` seeds the first message, and with neither it opens a plain regular chat. Rendered by delegation: the feed flags a slot/cell as an AI card and passes `data` opaquely; the card validates it against its own schema. `currency` defaults to "RM", `deltaTone` to "warning", `variant` to "hero".',
    category: 'spending',
    keywords: ['ai', 'insight', 'spend', 'carousel', 'mobile', 'categories', 'bar', 'bento', 'banner'],
    examples: [
      {
        label: 'Hero (full slide)',
        data: {
          variant: 'hero',
          period: 'June',
          headline:
            'Dining and Raya travel led your spend — up sharply on your 6-month rhythm.',
          amount: 6800,
          currency: 'RM',
          delta: '+45% vs 6-mo avg',
          deltaTone: 'warning',
          cta: 'Full Insight',
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
      {
        label: 'Wide (bento lead, col-span-2)',
        data: {
          variant: 'wide',
          period: 'This week',
          headline: 'Spending is tracking below your weekly budget — nice one.',
          amount: 820,
          currency: 'RM',
          delta: '−12% vs budget',
          deltaTone: 'positive',
          categories: [
            { label: 'Groceries', amount: 360 },
            { label: 'Transport', amount: 260 },
            { label: 'Dining', amount: 200 },
          ],
        },
      },
      {
        label: 'Tall (bento lead, row-span-2)',
        data: {
          variant: 'tall',
          period: 'Q2',
          headline: 'Dining is your fastest-growing category this quarter.',
          amount: 2450,
          currency: 'RM',
          delta: '+18%',
          deltaTone: 'warning',
          categories: [
            { label: 'Dining', amount: 2450 },
            { label: 'Shopping', amount: 1420 },
            { label: 'Transport', amount: 980 },
          ],
        },
      },
      {
        label: 'Compact (single bento cell)',
        data: {
          variant: 'compact',
          period: 'Subscriptions',
          headline: 'Three active subscriptions renew this month.',
          amount: 189,
          currency: 'RM',
          delta: '3 active',
          deltaTone: 'info',
          categories: [
            { label: 'Streaming', amount: 89 },
            { label: 'Cloud', amount: 60 },
            { label: 'Fitness', amount: 40 },
          ],
        },
      },
    ],
  },
}

export default docs
