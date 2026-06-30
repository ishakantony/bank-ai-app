import type { BlockDoc } from '../../docs/blockDocs'

export default {
  title: 'Suggestion pills',
  summary:
    'Up to four follow-up pills shown beneath a reply. Each item is a `prompt` (sends text back into the thread), a `link` (opens a URL), or a `signal` (fires a block-bus intent, e.g. re-opening a wizard). In chat these are hoisted below the message; here they render inline.',
  category: 'interactive',
  keywords: ['follow-up', 'pills', 'prompt', 'link', 'signal', 'quick replies'],
  examples: [
    {
      label: 'Savings follow-ups',
      data: {
        items: [
          {
            kind: 'prompt',
            label: 'How much can I save?',
            send: 'How much could I realistically save each month?',
          },
          { kind: 'prompt', label: 'Compare PRS providers' },
          { kind: 'link', label: 'EPF i-Saraan guide', url: 'https://www.kwsp.gov.my' },
          {
            kind: 'signal',
            label: 'Reassess my needs',
            target: 'needsWizard',
            name: 'open',
            payload: { fresh: true },
          },
        ],
      },
    },
  ],
} satisfies BlockDoc
