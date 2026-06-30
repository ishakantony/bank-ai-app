/**
 * Documentation metadata for every custom block — the single place to describe a
 * block for the `/docs` gallery. Keyed by the same name used in the block
 * registry and in a ```bank:<name>``` fence.
 *
 * The dependency direction is deliberately one-way: docs → blocks. Nothing in
 * the chat render path imports this file, so the example/prose strings never
 * land in the main bundle. The gallery iterates the *registry* (the source of
 * truth for which blocks exist) and looks each name up here, surfacing a
 * "documentation pending" placeholder for any registered block missing an entry.
 *
 * Examples use Malaysian / MYR scenarios (RM, EPF/PRS/ASB, DuitNow) per the
 * project locale rules.
 */
export interface BlockDoc {
  /** Human title shown above the example. */
  title: string
  /** One or two sentences on what the block is for and when to reach for it. */
  description: string
  /** The JSON body that goes inside the fence (pretty-printed). */
  example: string
}

export const blockDocs: Record<string, BlockDoc> = {
  allocationDonut: {
    title: 'Allocation donut',
    description:
      'A donut chart with a labelled legend for showing how something is split — a portfolio mix, a budget, spending by category. Slice values are relative and need not sum to 100.',
    example: `{
  "title": "Portfolio mix",
  "slices": [
    { "label": "ASB / ASNB", "value": 42 },
    { "label": "EPF", "value": 28 },
    { "label": "Unit trusts", "value": 18 },
    { "label": "Fixed deposit", "value": 12 }
  ]
}`,
  },
  driftBars: {
    title: 'Drift bars',
    description:
      'Grouped bars comparing a current value against a target per row, with a drift badge (▲ over / ▼ under). Good for goal progress or on-track / off-track tracking. `unit` defaults to "%".',
    example: `{
  "title": "Savings goals vs target",
  "unit": "%",
  "items": [
    { "label": "Emergency fund", "target": 100, "current": 72 },
    { "label": "EPF top-up (i-Saraan)", "target": 100, "current": 45 },
    { "label": "PRS contribution", "target": 100, "current": 88 }
  ]
}`,
  },
  spendTrend: {
    title: 'Spend trend',
    description:
      'A spending overview: two hero stats (total spend + transaction count) above a dual-line cumulative chart comparing this period against the previous one. Both `current` and `previous` are running totals keyed by day-of-month; `current` usually stops at today (`markerDay`, a dashed rule) while `previous` runs the full month, faded. `currency` defaults to "RM".',
    example: `{
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
}`,
  },
  spendDonut: {
    title: 'Spend donut',
    description:
      'A spending overview ring: two hero stats (total spend + transaction count, each with an optional "vs AVG" badge) above a donut whose centre shows the month and whose categories are splayed left/right with dashed leader lines. Each category percent defaults to its share of the amount; `side` pins a label left/right. `currency` defaults to "RM", `vsAvgTone` to "warning".',
    example: `{
  "month": "June",
  "currency": "RM",
  "spend": 6800,
  "transactions": 96,
  "spendVsAvg": "+45% vs AVG",
  "txnVsAvg": "+25 vs AVG",
  "categories": [
    { "label": "Dining", "amount": 2448 },
    { "label": "Shopping", "amount": 1632 },
    { "label": "Transport", "amount": 1156 },
    { "label": "Transfer", "amount": 544 },
    { "label": "Others", "amount": 1020 }
  ]
}`,
  },
  spendBreakdown: {
    title: 'Spend breakdown',
    description:
      'A detailed category breakdown: a header (period total + a "vs avg" badge) over a list of rows, each with an icon, label, percent (driving a coloured progress bar), amount, and an optional delta vs the usual rhythm — an increase reads amber, a decrease green, flat is muted. `icon` keys into dining/shopping/transport/transfer/bills/entertainment/others. `currency` defaults to "RM".',
    example: `{
  "title": "June Spend",
  "currency": "RM",
  "total": 6800,
  "vsAvg": "+RM2,110",
  "vsAvgLabel": "vs. 6-Month Avg",
  "categories": [
    { "label": "Dining", "icon": "dining", "percent": 36, "amount": 2448, "delta": "+RM530" },
    { "label": "Shopping", "icon": "shopping", "percent": 24, "amount": 1632, "delta": "+RM867" },
    { "label": "Transport", "icon": "transport", "percent": 17, "amount": 1156, "delta": "+RM548" },
    { "label": "Transfer", "icon": "transfer", "percent": 8, "amount": 544, "delta": "+RM100" },
    { "label": "Entertainment", "icon": "entertainment", "percent": 5, "amount": 340, "delta": "-RM22" },
    { "label": "Others", "icon": "others", "percent": 10, "amount": 680, "delta": "Flat" }
  ]
}`,
  },
  actionCard: {
    title: 'Action card',
    description:
      'A list of suggested actions, each with an optional detail line, plus an optional primary call-to-action button. Use it to turn advice into tappable next steps.',
    example: `{
  "title": "Ways to grow your savings",
  "actions": [
    {
      "label": "Set up a DuitNow standing instruction",
      "detail": "Auto-transfer RM500 to savings each payday"
    },
    {
      "label": "Open a PRS account",
      "detail": "Up to RM3,000 tax relief a year"
    },
    {
      "label": "Top up your EPF",
      "detail": "Voluntary i-Saraan contributions"
    }
  ],
  "cta": { "label": "Review my plan" }
}`,
  },
  suggestions: {
    title: 'Suggestion pills',
    description:
      'Up to four follow-up pills shown beneath a reply. Each item is a `prompt` (sends text back into the thread), a `link` (opens a URL), or a `signal` (fires a block-bus intent, e.g. re-opening a wizard). In chat these are hoisted below the message; here they render inline.',
    example: `{
  "items": [
    {
      "kind": "prompt",
      "label": "How much can I save?",
      "send": "How much could I realistically save each month?"
    },
    { "kind": "prompt", "label": "Compare PRS providers" },
    {
      "kind": "link",
      "label": "EPF i-Saraan guide",
      "url": "https://www.kwsp.gov.my"
    },
    {
      "kind": "signal",
      "label": "Reassess my needs",
      "target": "needsWizard",
      "name": "open",
      "payload": { "fresh": true }
    }
  ]
}`,
  },
  wizard: {
    title: 'Wizard',
    description:
      'A branching questionnaire. The card teases the first question; tapping "Get started" opens a drawer that walks through it. Each option points to the `next` question id, or omits `next` to end the flow. The `id` is the bus key a `signal` pill can address to re-open it.',
    example: `{
  "id": "needsWizard",
  "title": "Find the right savings plan",
  "subtitle": "Three quick questions",
  "start": "goal",
  "questions": {
    "goal": {
      "title": "What are you saving for?",
      "options": [
        { "value": "emergency", "label": "Emergency fund", "next": "horizon" },
        { "value": "retirement", "label": "Retirement", "next": "horizon" },
        { "value": "house", "label": "A home deposit", "next": "horizon" }
      ]
    },
    "horizon": {
      "title": "When will you need the money?",
      "options": [
        { "value": "short", "label": "Within 2 years", "next": "risk" },
        { "value": "long", "label": "5+ years", "next": "risk" }
      ]
    },
    "risk": {
      "title": "How do you feel about ups and downs?",
      "options": [
        { "value": "low", "label": "Keep it steady" },
        { "value": "high", "label": "I can ride out the dips" }
      ]
    }
  }
}`,
  },
}

/** Build the full ```bank:<name>``` fenced markdown for a block's example. */
export function blockFence(name: string, body: string): string {
  return '```bank:' + name + '\n' + body + '\n```'
}
