import type { BlockDoc } from '../../docs/blockDocs'

export default {
  title: 'Allocation donut',
  summary:
    'A donut chart with a labelled legend for showing how something is split — a portfolio mix, a budget, spending by category. Slice values are relative and need not sum to 100.',
  category: 'charts',
  keywords: ['portfolio', 'budget', 'allocation', 'asb', 'epf', 'split', 'pie', 'donut'],
  examples: [
    {
      label: 'Portfolio mix',
      data: {
        title: 'Portfolio mix',
        slices: [
          { label: 'ASB / ASNB', value: 42 },
          { label: 'EPF', value: 28 },
          { label: 'Unit trusts', value: 18 },
          { label: 'Fixed deposit', value: 12 },
        ],
      },
    },
    {
      label: 'Budget split',
      caption: 'A 50/30/20 monthly budget',
      data: {
        title: 'Monthly budget',
        slices: [
          { label: 'Needs', value: 50 },
          { label: 'Wants', value: 30 },
          { label: 'Savings', value: 20 },
        ],
      },
    },
  ],
} satisfies BlockDoc
