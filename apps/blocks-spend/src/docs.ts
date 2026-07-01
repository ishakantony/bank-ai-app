import type { BlockDoc } from '@bank-ai/blocks-kit'

/**
 * Docs for the spend blocks, exposed to the host's `/docs` gallery + playground
 * via Module Federation (the `./docs` expose). The remote owns its own
 * documentation the same way it owns its schema + component, so a team can keep
 * the two in sync without a host release. Keyed by block name (the
 * ```bank:<name>``` fence name).
 */
const docs: Record<string, BlockDoc> = {
  spendTrend: {
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
  },
  spendDonut: {
    title: 'Spend donut',
    summary:
      'A spending overview ring: two hero stats (total spend + transaction count, each with an optional "vs AVG" badge) above a donut whose centre shows the month and whose categories are splayed left/right with dashed leader lines. Each category percent defaults to its share of the amount; `side` pins a label left/right. `currency` defaults to "RM", `vsAvgTone` to "warning".',
    category: 'spending',
    keywords: ['spend', 'donut', 'categories', 'month', 'vs avg', 'breakdown', 'ring'],
    examples: [
      {
        label: 'June categories',
        data: {
          month: 'June',
          currency: 'RM',
          spend: 6800,
          transactions: 96,
          spendVsAvg: '+45% vs AVG',
          txnVsAvg: '+25 vs AVG',
          categories: [
            { label: 'Dining', amount: 2448 },
            { label: 'Shopping', amount: 1632 },
            { label: 'Transport', amount: 1156 },
            { label: 'Transfer', amount: 544 },
            { label: 'Others', amount: 1020 },
          ],
        },
      },
    ],
  },
  spendBreakdown: {
    title: 'Spend breakdown',
    summary:
      'A detailed category breakdown: a header (period total + a "vs avg" badge) over a list of rows, each with an icon, label, percent (driving a coloured progress bar), amount, and an optional delta vs the usual rhythm — an increase reads amber, a decrease green, flat is muted. `icon` keys into dining/shopping/transport/transfer/bills/entertainment/others. `currency` defaults to "RM".',
    category: 'spending',
    keywords: ['spend', 'breakdown', 'categories', 'delta', 'progress', 'icons', 'list'],
    examples: [
      {
        label: 'June spend',
        data: {
          title: 'June Spend',
          currency: 'RM',
          total: 6800,
          vsAvg: '+RM2,110',
          vsAvgLabel: 'vs. 6-Month Avg',
          categories: [
            { label: 'Dining', icon: 'dining', percent: 36, amount: 2448, delta: '+RM530' },
            { label: 'Shopping', icon: 'shopping', percent: 24, amount: 1632, delta: '+RM867' },
            { label: 'Transport', icon: 'transport', percent: 17, amount: 1156, delta: '+RM548' },
            { label: 'Transfer', icon: 'transfer', percent: 8, amount: 544, delta: '+RM100' },
            { label: 'Entertainment', icon: 'entertainment', percent: 5, amount: 340, delta: '-RM22' },
            { label: 'Others', icon: 'others', percent: 10, amount: 680, delta: 'Flat' },
          ],
        },
      },
    ],
  },
}

export default docs
