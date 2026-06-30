import type { BlockDoc } from '../../docs/blockDocs'

export default {
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
} satisfies BlockDoc
