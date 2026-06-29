/**
 * Plain-markdown content for the docs Gallery (the "Markdown basics" section),
 * the Playground's insert palette, and its starter documents. Kept out of the
 * chat bundle — only the lazily-loaded `/docs` route imports this.
 */

/** A single document exercising the markdown affordances replies can use. */
export const MARKDOWN_BASICS = `## Headings & prose

Replies render as **GitHub-flavoured markdown**. You get _emphasis_,
~~strikethrough~~, \`inline code\`, and [links](https://www.bankai.example).

> Blockquotes work too — handy for quoting a policy or a rate.

### Lists

- Easy-access savings
- Fixed deposits
- Unit trusts

1. Set a goal
2. Automate a transfer
3. Review monthly

### Task list

- [x] Open an account
- [ ] Set up a DuitNow standing instruction
- [ ] Top up EPF

### Table

| Product | Rate | Min |
| --- | --- | --- |
| Easy-access | 2.5% | RM0 |
| Fixed deposit (12m) | 3.85% | RM1,000 |
| PRS | varies | RM100 |

### Inline highlights

Your savings are :hl[on track]{tone=positive}, but card spending is
:hl[up 18%]{tone=negative} this month. Your TAC expires in
:hl[60 seconds]{tone=warning} — note the :hl[reference number]{tone=info}.
`

/** Quick-insert markdown snippets for the playground palette. */
export const MARKDOWN_SNIPPETS: { label: string; snippet: string }[] = [
  { label: 'Heading', snippet: '## Heading\n' },
  {
    label: 'Table',
    snippet:
      '| Product | Rate | Min |\n| --- | --- | --- |\n| Easy-access | 2.5% | RM0 |\n| Fixed deposit | 3.85% | RM1,000 |\n',
  },
  { label: 'Task list', snippet: '- [x] Done\n- [ ] To do\n' },
  { label: 'Quote', snippet: '> A quoted note.\n' },
  {
    label: 'Highlight',
    snippet: ':hl[on track]{tone=positive}',
  },
  { label: 'Link', snippet: '[Bank AI](https://www.bankai.example)' },
]

/** Full starter documents loadable into the playground editor. */
export const STARTERS: { label: string; content: string }[] = [
  {
    label: 'Savings review',
    content: `## Your savings snapshot

You're saving :hl[RM850 / month]{tone=positive} — that's **17%** of your income.

\`\`\`bank:driftBars
{
  "title": "Goals vs target",
  "unit": "%",
  "items": [
    { "label": "Emergency fund", "target": 100, "current": 72 },
    { "label": "PRS contribution", "target": 100, "current": 88 }
  ]
}
\`\`\`

Here are a few ways to do even better:

\`\`\`bank:actionCard
{
  "title": "Next steps",
  "actions": [
    { "label": "Increase your DuitNow auto-transfer", "detail": "Try RM1,000 each payday" },
    { "label": "Top up your EPF", "detail": "Voluntary i-Saraan contributions" }
  ],
  "cta": { "label": "Review my plan" }
}
\`\`\`

\`\`\`bank:suggestions
{
  "items": [
    { "kind": "prompt", "label": "How much can I save?" },
    { "kind": "link", "label": "EPF i-Saraan guide", "url": "https://www.kwsp.gov.my" }
  ]
}
\`\`\`
`,
  },
  {
    label: 'Spending this month',
    content: `## Spending this month

You've spent :hl[RM2,140]{tone=warning} so far — about **18% more** than the same
point in May. Most of the lift is **dining & travel**.

\`\`\`bank:spendTrend
{
  "spend": 2140,
  "transactions": 27,
  "currency": "RM",
  "currentLabel": "June",
  "previousLabel": "May",
  "markerDay": 15,
  "current": [
    { "day": 1, "amount": 120 },
    { "day": 5, "amount": 540 },
    { "day": 10, "amount": 1280 },
    { "day": 15, "amount": 2140 }
  ],
  "previous": [
    { "day": 1, "amount": 100 },
    { "day": 5, "amount": 460 },
    { "day": 10, "amount": 1020 },
    { "day": 15, "amount": 1660 },
    { "day": 30, "amount": 2980 }
  ]
}
\`\`\`

\`\`\`bank:suggestions
{
  "items": [
    { "kind": "prompt", "label": "Show me spending in May" },
    { "kind": "prompt", "label": "How much did I spend this year" }
  ]
}
\`\`\`
`,
  },
  {
    label: 'Portfolio breakdown',
    content: `## Where your money sits

\`\`\`bank:allocationDonut
{
  "title": "Portfolio mix",
  "slices": [
    { "label": "ASB / ASNB", "value": 42 },
    { "label": "EPF", "value": 28 },
    { "label": "Unit trusts", "value": 18 },
    { "label": "Fixed deposit", "value": 12 }
  ]
}
\`\`\`

Your allocation has :hl[drifted]{tone=negative} from your target. Want to rebalance?
`,
  },
  {
    label: 'Plain markdown',
    content: MARKDOWN_BASICS,
  },
]
