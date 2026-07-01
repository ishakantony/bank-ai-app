import type { BlockDoc } from '../../docs/blockDocs'

export default {
  title: 'Spend trend',
  summary:
    'A spending overview: two hero stats (total spend + transaction count) above a dual-line cumulative chart comparing this period against the previous one. Both `current` and `previous` are running totals keyed by day-of-month; `current` usually stops at today (`markerDay`, a dashed rule) while `previous` runs the full month, faded. `currency` defaults to "RM".',
  category: 'spending',
  keywords: ['spend', 'trend', 'month', 'cumulative', 'transactions', 'compare', 'line'],
  examples: [
    {
      label: 'June vs May',
      data: {
        spend: 2140,
        transactions: 27,
        currency: 'RM',
        currentLabel: 'June',
        previousLabel: 'May',
        markerDay: 15,
        current: [
          { day: 1, amount: 120 },
          { day: 5, amount: 540 },
          { day: 10, amount: 1280 },
          { day: 15, amount: 2140 },
        ],
        previous: [
          { day: 1, amount: 100 },
          { day: 5, amount: 460 },
          { day: 10, amount: 1020 },
          { day: 15, amount: 1660 },
          { day: 30, amount: 2980 },
        ],
      },
    },
  ],
} satisfies BlockDoc
