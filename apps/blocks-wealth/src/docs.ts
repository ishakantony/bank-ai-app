import type { BlockDoc } from '@bank-ai/blocks-kit'

/**
 * Docs for the wealth blocks, exposed to the host's `/docs` gallery + playground
 * via Module Federation (the `./docs` expose). The remote owns its own
 * documentation the same way it owns its schema + component, so a team can keep
 * the two in sync without a host release. Keyed by block name (the
 * ```bank:<name>``` fence name).
 */
const docs: Record<string, BlockDoc> = {
  wizard: {
    title: 'Wizard',
    summary:
      'A branching questionnaire. The card teases the first question; tapping "Get started" opens a drawer that walks through it. Each option points to the `next` question id, or omits `next` to end the flow (that option shows Submit). Going back and changing an answer truncates everything downstream. The `id` is the bus key a `signal` suggestion pill can address (with `payload: { "fresh": true }`) to re-open it from a later message.',
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
  },
  allocationDonut: {
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
  },
  driftBars: {
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
  },
  actionCard: {
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
  },
}

export default docs
