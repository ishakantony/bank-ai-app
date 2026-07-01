import type { BlockDoc } from '../../docs/blockDocs'

export default {
  title: 'Drift bars',
  summary:
    'Grouped bars comparing a current value against a target per row, with a drift badge (▲ over / ▼ under). Good for goal progress or on-track / off-track tracking. `unit` defaults to "%".',
  category: 'charts',
  keywords: ['goal', 'target', 'progress', 'drift', 'on-track', 'savings', 'bars'],
  examples: [
    {
      label: 'Savings goals',
      data: {
        title: 'Savings goals vs target',
        unit: '%',
        items: [
          { label: 'Emergency fund', target: 100, current: 72 },
          { label: 'EPF top-up (i-Saraan)', target: 100, current: 45 },
          { label: 'PRS contribution', target: 100, current: 88 },
        ],
      },
    },
  ],
} satisfies BlockDoc
