import type { BlockDoc } from '../../docs/blockDocs'

export default {
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
} satisfies BlockDoc
