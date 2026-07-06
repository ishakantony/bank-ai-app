import { http, HttpResponse, delay } from 'msw'
import type { ChatTurn } from '../api/chat'
import type {
  BlockRemoteManifest,
  Insight,
  ThreadId,
  Topic,
} from '@bank-poc/shared'

// Mirrors the Hono server's manifest so mock mode drives runtime block loading
// too. Both point the host at the local spend (:9998) and portfolio (:9997)
// remotes.
const blockRemotes: BlockRemoteManifest = {
  remotes: [
    {
      name: 'blocksSpend',
      entry: 'http://localhost:9998/remoteEntry.js',
      blocks: ['spendTrend', 'spendDonut', 'spendBreakdown'],
    },
    {
      name: 'blocksPortfolio',
      entry: 'http://localhost:9997/remoteEntry.js',
      blocks: ['portfolioValue', 'holdingsTable', 'allocationRing'],
    },
    {
      name: 'blocksWealth',
      entry: 'http://localhost:9996/remoteEntry.js',
      blocks: ['wizard', 'allocationDonut', 'driftBars', 'actionCard'],
    },
  ],
}

const topics: Topic[] = [
  {
    id: 'transfer',
    name: 'Transfer Money',
    description: 'Send funds to anyone, instantly and securely.',
    icon: 'transfer',
  },
  {
    id: 'cards',
    name: 'Card Services',
    description: 'Freeze, replace or manage your cards.',
    icon: 'card',
  },
  {
    id: 'savings',
    name: 'Savings & Goals',
    description: 'Track your goals and grow your savings.',
    icon: 'savings',
  },
  {
    id: 'security',
    name: 'Fraud & Security',
    description: 'Report suspicious activity and stay protected.',
    icon: 'security',
  },
  {
    id: 'insights',
    name: 'Insights',
    description: 'Personalized tips to make the most of your money.',
    icon: 'insights',
  },
]

const insights: Insight[] = [
  {
    id: 'portfolio',
    title: 'Your investment portfolio needs rebalancing',
    description: 'Your allocation has drifted from your target. Tap to review.',
    icon: 'portfolio',
    tone: 'amber',
  },
  {
    id: 'spending',
    title: 'Spending this month',
    description: "You've spent RM6,800 — 45% more than your usual average.",
    icon: 'spending',
    tone: 'blue',
  },
  {
    id: 'idleCash',
    title: 'Idle cash',
    description: 'RM8,500 sitting in checking could be earning more.',
    icon: 'idleCash',
    tone: 'green',
  },
]

// Canned assistant replies, keyed by thread. The frontend fakes streaming by
// typewriter-revealing whichever full string we return here.
const replies: Record<ThreadId, string> = {
  transfer: `### Sending money

Happy to help you move funds. Here are your current **transfer limits and arrival times**:

| Method | Daily limit | Arrives | Fee |
| --- | --- | ---: | --- |
| DuitNow (instant) | RM25,000 | Seconds | Free |
| IBG (Interbank GIRO) | RM50,000 | Same/next business day | Free |
| International (SWIFT) | RM20,000 | 2–4 business days | RM15 |

To get started I'll need:

1. **Who** you're paying (a saved payee or a new recipient)
2. **How much** you'd like to send
3. **Which account** to send from

> 💡 Tip: Instant payments to a *new* recipient are held for review for up to 30 minutes the first time.

Who would you like to pay? You can also [manage your saved payees](https://example.com/payees).`,

  cards: `### Your cards

Here's a snapshot of the cards on your account:

| Card | Last 4 | Status | Monthly spend |
| --- | --- | --- | ---: |
| Everyday Debit | \`4471\` | 🟢 Active | RM1,240 |
| Travel Credit | \`8820\` | 🟢 Active | RM312 |
| Old Debit | \`1093\` | 🔴 Frozen | RM0 |

I can help you:

- **Freeze or unfreeze** a card instantly
- Order a **replacement** for a lost or damaged card
- Adjust **spending controls** and contactless limits

> ⚠️ If your card was lost or stolen, freeze it now and I'll start a replacement straight away.

Which card are we talking about?`,

  savings: `### Savings & goals

Great — let's grow those savings. Here's how your goals are tracking:

| Goal | Target | Saved | Progress |
| --- | ---: | ---: | --- |
| Emergency fund | RM6,000 | RM4,500 | 75% |
| Holiday 2026 | RM2,000 | RM600 | 30% |
| New laptop | RM1,500 | RM1,500 | ✅ Done |

A few things I can set up for you:

1. Open a **new goal** with an automatic monthly transfer
2. Project **how long** it'll take to hit a target at your current rate
3. Round up everyday spending into savings

> At RM250/month, your *Holiday 2026* goal is on track to complete by **November 2026**.

What are you saving for? You can also [view all goals](https://example.com/goals).`,

  security: `### Fraud & security

Your security is the priority. Here's the **recent activity** I flagged for review:

| Date | Merchant | Amount | Flag |
| --- | --- | ---: | --- |
| 24/06 | Unknown – Online | RM89.99 | 🔺 High risk |
| 23/06 | Kopitiam | RM4.20 | OK |
| 22/06 | Streaming Co. | RM12.99 | OK |

If you don't recognise the **RM89.99** charge, here's what we'll do:

- [x] Freeze the affected card
- [ ] Dispute the transaction
- [ ] Issue a replacement card

> ⚠️ **Never** share your one-time passcode (TAC) — Bank AI will never ask for it.

Want me to start a dispute? You can also [report fraud here](https://example.com/report-fraud).`,

  insights: `### Your financial insights

I keep an eye on your money and surface what matters. Right now I'm tracking:

| Insight | What's up |
| --- | --- |
| **Portfolio drift** | Your allocation has moved away from target |
| **Monthly spending** | You're trending 18% above last month |
| **Idle cash** | RM8,500 could be working harder |

Tap any insight above, or ask me something like *"why is my spending up?"*`,

  general: `## Hi, I'm Bank AI 👋

I can help you take care of your money. Here's what I'm good at:

| Topic | What I can do |
| --- | --- |
| **Transfers** | Send money, manage payees, check limits |
| **Cards** | Freeze, replace, set spending controls |
| **Savings** | Open goals, automate saving, track progress |
| **Security** | Review activity, lock your account, report fraud |

Just tell me what you'd like to do — for example:

- *"Send RM200 to Sam"*
- *"Freeze my travel card"*
- *"How's my holiday goal doing?"*

What would you like to do first?

\`\`\`bank:suggestions
{ "items": [
  { "kind": "prompt", "label": "Send money", "send": "I'd like to send some money" },
  { "kind": "prompt", "label": "Freeze a card" },
  { "kind": "prompt", "label": "Check my savings goals" },
  { "kind": "link", "label": "Open the banking app", "url": "https://example.com/app" }
] }
\`\`\``,
}

// The spends journey. `spendThisMonth` leads with the `spendDonut` overview and
// offers a "View detailed breakdown" follow-up that resolves to
// `spendBreakdownReply` (the richer `spendBreakdown` list). Both are keyed in
// `insightReplies` under several phrasings so navigation never dead-ends.
const spendThisMonth = `### Spending this month

You've spent :hl[RM6,800]{tone=warning} in June — about **45% higher** than your usual 6-month average. Don't worry, your **school-holiday getaway to Langkawi** was the primary driver behind this!

\`\`\`bank:spendDonut
{
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
}
\`\`\`

**Shopping** saw the biggest jump — duty-free finds on the island — while meals out and flights nudged **dining** and **transport** up too. Want the full category-by-category picture?

\`\`\`bank:suggestions
{ "items": [
  { "kind": "prompt", "label": "View detailed breakdown" },
  { "kind": "prompt", "label": "Show me spending in May" },
  { "kind": "prompt", "label": "How much did I spend this year" }
] }
\`\`\``

// Reached from the "View detailed breakdown" pill on the month overview.
const spendBreakdownReply = `### June, category by category

You spent :hl[RM6,800]{tone=warning} in June — :hl[45% higher]{tone=warning} than your usual 6-month average. But don't worry, your **school-holiday getaway to Langkawi** was the :hl[primary driver]{tone=positive} behind this!

**Shopping** experienced the most noticeable jump at :hl[+RM867]{tone=warning} above your usual rhythm — duty-free shopping on the island — while island meals and flights nudged **dining** and **transport** up by :hl[+RM530]{tone=warning} and :hl[+RM548]{tone=warning}.

\`\`\`bank:spendBreakdown
{
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
    { "label": "Bills & Utility", "icon": "bills", "percent": 6, "amount": 408, "delta": "Flat" },
    { "label": "Entertainment", "icon": "entertainment", "percent": 5, "amount": 340, "delta": "-RM22" },
    { "label": "Others", "icon": "others", "percent": 4, "amount": 272, "delta": "+RM87" }
  ]
}
\`\`\`

Setting a dining budget could keep next month closer to your usual pace. Want me to dig into a specific month, or look at the whole year?

\`\`\`bank:suggestions
{ "items": [
  { "kind": "prompt", "label": "Show me spending in May" },
  { "kind": "prompt", "label": "How much did I spend this year" }
] }
\`\`\``

const spendInMay = `### Spending in May

In May you spent :hl[RM2,010]{tone=positive} across 24 transactions — about **8% less** than April. Groceries and transport stayed flat; the drop came from fewer shopping trips.

\`\`\`bank:spendTrend
{
  "spend": 2010,
  "transactions": 24,
  "currency": "RM",
  "currentLabel": "May",
  "previousLabel": "April",
  "markerDay": 30,
  "current": [
    { "day": 1, "amount": 75 }, { "day": 3, "amount": 200 }, { "day": 5, "amount": 330 },
    { "day": 7, "amount": 470 }, { "day": 9, "amount": 610 }, { "day": 11, "amount": 760 },
    { "day": 13, "amount": 900 }, { "day": 15, "amount": 1050 }, { "day": 17, "amount": 1190 },
    { "day": 19, "amount": 1330 }, { "day": 21, "amount": 1480 }, { "day": 23, "amount": 1620 },
    { "day": 25, "amount": 1720 }, { "day": 27, "amount": 1810 }, { "day": 30, "amount": 1910 },
    { "day": 31, "amount": 2010 }
  ],
  "previous": [
    { "day": 1, "amount": 95 }, { "day": 3, "amount": 250 }, { "day": 5, "amount": 410 },
    { "day": 7, "amount": 580 }, { "day": 9, "amount": 760 }, { "day": 11, "amount": 940 },
    { "day": 13, "amount": 1110 }, { "day": 15, "amount": 1300 }, { "day": 17, "amount": 1470 },
    { "day": 19, "amount": 1640 }, { "day": 21, "amount": 1820 }, { "day": 23, "amount": 1960 },
    { "day": 25, "amount": 2070 }, { "day": 27, "amount": 2140 }, { "day": 30, "amount": 2180 }
  ]
}
\`\`\`

\`\`\`bank:suggestions
{ "items": [
  { "kind": "prompt", "label": "Show me spending in June", "send": "Show me spending in June" },
  { "kind": "prompt", "label": "How much did I spend this year" }
] }
\`\`\``

const spendThisYear = `### Spending so far this year

You've spent :hl[RM12,480]{tone=info} over the first six months — an average of **RM2,080 a month**. June is your biggest month so far at RM2,140; February was the leanest at RM1,760.

\`\`\`bank:allocationDonut
{
  "title": "Spending by category (year to date)",
  "slices": [
    { "label": "Dining & takeaway", "value": 28 },
    { "label": "Groceries", "value": 22 },
    { "label": "Shopping", "value": 18 },
    { "label": "Transport", "value": 16 },
    { "label": "Travel", "value": 10 },
    { "label": "Subscriptions", "value": 6 }
  ]
}
\`\`\`

Dining and groceries together make up half your spend. A RM2,000 monthly budget would keep you on last year's pace.

\`\`\`bank:suggestions
{ "items": [
  { "kind": "prompt", "label": "Show me spending in May" },
  { "kind": "prompt", "label": "Show me spending in June", "send": "Show me spending in June" }
] }
\`\`\``

// Reached from the "Show my full portfolio" pill on the rebalancing reply.
// Showcases the federated `portfolio` block remote (portfolioValue,
// holdingsTable, allocationRing) — loaded at runtime from :9997.
const portfolioOverview = `### Your portfolio at a glance

Your investments are worth :hl[RM164,200]{tone=positive} today — up :hl[RM12,400 (8.2%)]{tone=positive} over the past year.

\`\`\`bank:portfolioValue
{
  "value": 164200,
  "currency": "RM",
  "periodLabel": "Past 12 months",
  "gain": 12400,
  "gainPct": 8.2,
  "series": [
    { "label": "Jul", "value": 151800 },
    { "label": "Sep", "value": 154300 },
    { "label": "Nov", "value": 149600 },
    { "label": "Jan", "value": 157100 },
    { "label": "Mar", "value": 159900 },
    { "label": "May", "value": 164200 }
  ]
}
\`\`\`

Here's how that value splits across your holdings:

\`\`\`bank:holdingsTable
{
  "title": "Your holdings",
  "currency": "RM",
  "total": 164200,
  "holdings": [
    { "name": "EPF", "category": "epf", "value": 82400, "returnPct": 5.4 },
    { "name": "ASB", "category": "asb", "value": 38600, "returnPct": 5.0 },
    { "name": "Public Mutual PRS Growth", "category": "prs", "value": 21800, "returnPct": 9.1 },
    { "name": "Global Equity Unit Trust", "category": "unitTrust", "value": 14200, "returnPct": -2.3 },
    { "name": "Bursa shares", "category": "stocks", "value": 5400, "returnPct": 12.6 },
    { "name": "Cash", "category": "cash", "value": 1800, "returnPct": 0 }
  ]
}
\`\`\`

And your split by asset class:

\`\`\`bank:allocationRing
{
  "title": "Asset allocation",
  "currency": "RM",
  "total": 164200,
  "slices": [
    { "label": "Equities", "value": 82100 },
    { "label": "Fixed income", "value": 41050 },
    { "label": "Unit trusts", "value": 24630 },
    { "label": "Cash", "value": 16420 }
  ]
}
\`\`\`

\`\`\`bank:suggestions
{ "items": [
  { "kind": "prompt", "label": "Rebalance my portfolio", "send": "Your investment portfolio needs rebalancing" },
  { "kind": "link", "label": "Open the investing app", "url": "https://example.com/portfolio" }
] }
\`\`\``

// Insight-specific replies, keyed by the insight title the welcome screen sends
// as the user message. Looked up only on the `insights` thread.
const insightReplies: Record<string, string> = {
  'Your investment portfolio needs rebalancing': `### Portfolio rebalancing

Your allocation has :hl[drifted]{tone=negative} as markets moved. Here's where you stand today — equities **68%**, bonds **24%**, cash **8%**:

\`\`\`bank:allocationDonut
{ "title": "Current allocation", "slices": [
  { "label": "Equities", "value": 68 },
  { "label": "Bonds", "value": 24 },
  { "label": "Cash", "value": 8 }
] }
\`\`\`

Against your **target**, equities are over and bonds are under:

\`\`\`bank:driftBars
{ "title": "Target vs current", "unit": "%", "items": [
  { "label": "Equities", "target": 60, "current": 68 },
  { "label": "Bonds", "target": 30, "current": 24 },
  { "label": "Cash", "target": 10, "current": 8 }
] }
\`\`\`

To get back on target, I'd suggest:

\`\`\`bank:actionCard
{ "title": "Suggested trades", "actions": [
  { "label": "Trim equities", "detail": "Sell ~RM4,200 to lock in recent gains" },
  { "label": "Top up bonds", "detail": "Restore your income buffer" },
  { "label": "Set quarterly auto-rebalance", "detail": "Keeps your mix on target automatically" }
], "cta": { "label": "Prepare these trades for review" } }
\`\`\`

> ⚖️ Rebalancing now keeps your risk in line with your plan.

Want me to prepare these trades for your review?

\`\`\`bank:suggestions
{ "items": [
  { "kind": "prompt", "label": "Prepare the trades", "send": "Prepare these trades for review" },
  { "kind": "prompt", "label": "Show my full portfolio", "send": "Show my full portfolio" },
  { "kind": "prompt", "label": "Why did it drift?" }
] }
\`\`\``,

  'Show my full portfolio': portfolioOverview,
  'Show my portfolio': portfolioOverview,

  'Spending this month': spendThisMonth,
  'Show me spending in June': spendThisMonth,
  'View detailed breakdown': spendBreakdownReply,
  'Show me the detailed breakdown': spendBreakdownReply,
  'Show me spending in May': spendInMay,
  'How much did I spend this year': spendThisYear,

  'Idle cash': `### Idle cash

You're holding :hl[RM8,500]{tone=positive} in checking earning just **0.1%**. Before I suggest where it should go, let's tailor it to what you actually want this money to do.

\`\`\`bank:wizard
{
  "id": "idleCash",
  "title": "Make your idle cash work",
  "subtitle": "A few quick questions to tailor your options",
  "start": "aim",
  "questions": {
    "aim": {
      "title": "What's your aim for this money?",
      "options": [
        { "value": "wealth", "label": "Grow my wealth", "next": "horizon" },
        { "value": "retire", "label": "Save for retirement", "next": "retireWhen" },
        { "value": "home", "label": "Buy a home", "next": "homeWhen" },
        { "value": "buffer", "label": "Keep a rainy-day buffer" }
      ]
    },
    "horizon": {
      "title": "Over what time frame?",
      "options": [
        { "value": "short", "label": "Under 3 years" },
        { "value": "mid", "label": "3 to 5 years", "next": "risk" },
        { "value": "long", "label": "5 years or more", "next": "risk" }
      ]
    },
    "risk": {
      "title": "How do you feel about ups and downs?",
      "options": [
        { "value": "cautious", "label": "Keep it steady" },
        { "value": "balanced", "label": "A balanced mix" },
        { "value": "adventurous", "label": "Chase higher returns" }
      ]
    },
    "retireWhen": {
      "title": "How far off is retirement?",
      "options": [
        { "value": "soon", "label": "Less than 5 years" },
        { "value": "midway", "label": "5 to 15 years" },
        { "value": "far", "label": "More than 15 years" }
      ]
    },
    "homeWhen": {
      "title": "When do you hope to buy?",
      "options": [
        { "value": "soon", "label": "Within 2 years" },
        { "value": "later", "label": "2 to 5 years away" }
      ]
    }
  }
}
\`\`\`

Tap **Get started** and I'll line up the right options for you.`,
}

// Shown beneath every post-questionnaire reply. The `signal` pill re-opens the
// idle-cash wizard fresh — the cross-message trigger — alongside normal pills.
const wizardSuggestions = `\`\`\`bank:suggestions
{ "items": [
  { "kind": "signal", "label": "Reassess my needs", "target": "idleCash", "name": "open", "payload": { "fresh": true } },
  { "kind": "prompt", "label": "Open easy-access savings", "send": "Open an easy-access savings account and move RM6,500" },
  { "kind": "link", "label": "Compare rates", "url": "https://example.com/savings" }
] }
\`\`\``

// Post-submission replies, keyed by the first answer (the "aim" option label).
const wizardReplies: Record<string, string> = {
  'Grow my wealth': `### A plan for growth

Thanks — that helps. With growth as your aim, a **unit trust or ASNB fund (e.g. ASB)** fits well: historically these have outpaced cash over longer horizons, though values can fall as well as rise.

- Keep ~RM2,000 in easy-access as a buffer
- Invest the rest in a diversified, low-cost fund
- Automate a monthly top-up to smooth out the ups and downs

> 📈 Time *in* the market tends to matter more than timing it.`,

  'Save for retirement': `### Building your retirement pot

A retirement aim usually means a longer runway, so tax-efficient options do the heavy lifting. Topping up your **EPF (voluntary, via i-Saraan)** or a **PRS (Private Retirement Scheme, tax relief up to RM3,000/yr)** could turn this idle cash into meaningful future income.

- Check how much of this year's PRS tax relief you've used
- Consider a low-cost global fund for the long term
- Revisit the mix as retirement gets closer`,

  'Buy a home': `### Saving toward your home

For a deposit, certainty matters more than chasing returns. A top **fixed deposit** or an **ASB** account keeps the money safe while it grows steadily.

- Lock away what you won't need before completion
- Keep the rest instant-access for flexibility`,

  'Keep a rainy-day buffer': `### A stronger safety net

Smart instinct — a rainy-day buffer should stay **instant-access**. But it shouldn't sit at 0.1%: moving it to **easy-access savings** earns roughly :hl[RM280 more a year]{tone=positive} with no lock-in.

> 💰 Same money, same access — just a better rate.`,

  default: `### Here's what I'd suggest

Based on your answers, the simplest win is moving most of this idle cash into **easy-access savings** — roughly :hl[RM280 more a year]{tone=positive}, with instant access kept for emergencies.`,
}

/** Detects a questionnaire submission (the `Q: …` / `A: …` message shape). */
function isWizardSubmission(message: string): boolean {
  return /^Q:\s.+\nA:\s/m.test(message)
}

/** The first answer in a submission — used to tailor the reply by aim. */
function firstAnswer(message: string): string {
  return message.match(/A:\s*(.+)/)?.[1]?.trim() ?? ''
}

export const handlers = [
  http.get('/api/topics', async () => {
    // Artificial latency so the loading skeletons are visible.
    await delay(600)
    return HttpResponse.json(topics)
  }),

  http.get('/api/insights', async () => {
    await delay(600)
    return HttpResponse.json(insights)
  }),

  http.get('/api/block-remotes', async () => {
    await delay(150)
    return HttpResponse.json(blockRemotes)
  }),

  http.post('/api/chat', async ({ request }) => {
    const { threadId, messages } = (await request.json()) as {
      threadId: ThreadId
      messages: ChatTurn[]
    }
    // The client sends the full thread for context; the canned replies only
    // care about the latest user turn.
    const message = messages.filter((m) => m.role === 'user').at(-1)?.content ?? ''
    // Backend returns the full reply; streaming is faked client-side.
    await delay(700)
    if (threadId === 'insights') {
      // A questionnaire submission: tailor the reply by the first answer and
      // append the follow-up pills (incl. "Reassess my needs").
      if (isWizardSubmission(message)) {
        const body = wizardReplies[firstAnswer(message)] ?? wizardReplies.default
        return HttpResponse.json({ reply: `${body}\n\n${wizardSuggestions}` })
      }
      // Otherwise match the message text to an insight reply.
      if (insightReplies[message]) {
        return HttpResponse.json({ reply: insightReplies[message] })
      }
    }
    return HttpResponse.json({ reply: replies[threadId] ?? replies.general })
  }),
]
