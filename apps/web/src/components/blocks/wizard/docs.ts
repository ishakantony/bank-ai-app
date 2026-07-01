import type { BlockDoc } from '../../docs/blockDocs'

export default {
  title: 'Wizard',
  summary:
    'A branching questionnaire. The card teases the first question; tapping "Get started" opens a drawer that walks through it. Each option points to the `next` question id, or omits `next` to end the flow. The `id` is the bus key a `signal` pill can address to re-open it.',
  category: 'interactive',
  keywords: ['wizard', 'questionnaire', 'flow', 'branching', 'drawer', 'questions'],
  examples: [
    {
      label: 'Savings plan finder',
      data: {
        id: 'needsWizard',
        title: 'Find the right savings plan',
        subtitle: 'Three quick questions',
        start: 'goal',
        questions: {
          goal: {
            title: 'What are you saving for?',
            options: [
              { value: 'emergency', label: 'Emergency fund', next: 'horizon' },
              { value: 'retirement', label: 'Retirement', next: 'horizon' },
              { value: 'house', label: 'A home deposit', next: 'horizon' },
            ],
          },
          horizon: {
            title: 'When will you need the money?',
            options: [
              { value: 'short', label: 'Within 2 years', next: 'risk' },
              { value: 'long', label: '5+ years', next: 'risk' },
            ],
          },
          risk: {
            title: 'How do you feel about ups and downs?',
            options: [
              { value: 'low', label: 'Keep it steady' },
              { value: 'high', label: 'I can ride out the dips' },
            ],
          },
        },
      },
    },
  ],
} satisfies BlockDoc
