import type { BlockDoc } from '../../docs/blockDocs'

export default {
  title: 'Action card',
  summary:
    'A list of suggested actions, each with an optional detail line, plus an optional primary call-to-action button. Use it to turn advice into tappable next steps.',
  category: 'cards',
  keywords: ['actions', 'cta', 'next steps', 'suggestions', 'tasks', 'checklist'],
  examples: [
    {
      label: 'Grow savings',
      data: {
        title: 'Ways to grow your savings',
        actions: [
          {
            label: 'Set up a DuitNow standing instruction',
            detail: 'Auto-transfer RM500 to savings each payday',
          },
          { label: 'Open a PRS account', detail: 'Up to RM3,000 tax relief a year' },
          { label: 'Top up your EPF', detail: 'Voluntary i-Saraan contributions' },
        ],
        cta: { label: 'Review my plan' },
      },
    },
  ],
} satisfies BlockDoc
