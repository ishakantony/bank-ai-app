import { http, HttpResponse, delay } from 'msw'
import type { Insight, ThreadId, Topic } from '../types'

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
    description: "You've spent £2,140 — 18% more than last month.",
    icon: 'spending',
    tone: 'blue',
  },
  {
    id: 'idleCash',
    title: 'Idle cash',
    description: '£8,500 sitting in checking could be earning more.',
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
| Instant payment | £25,000 | Seconds | Free |
| Standard transfer | £50,000 | 1–2 business days | Free |
| International (SWIFT) | £20,000 | 2–4 business days | £15 |

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
| Everyday Debit | \`4471\` | 🟢 Active | £1,240 |
| Travel Credit | \`8820\` | 🟢 Active | £312 |
| Old Debit | \`1093\` | 🔴 Frozen | £0 |

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
| Emergency fund | £6,000 | £4,500 | 75% |
| Holiday 2026 | £2,000 | £600 | 30% |
| New laptop | £1,500 | £1,500 | ✅ Done |

A few things I can set up for you:

1. Open a **new goal** with an automatic monthly transfer
2. Project **how long** it'll take to hit a target at your current rate
3. Round up everyday spending into savings

> At £250/month, your *Holiday 2026* goal is on track to complete by **November 2026**.

What are you saving for? You can also [view all goals](https://example.com/goals).`,

  security: `### Fraud & security

Your security is the priority. Here's the **recent activity** I flagged for review:

| Date | Merchant | Amount | Flag |
| --- | --- | ---: | --- |
| 24 Jun | Unknown – Online | £89.99 | 🔺 High risk |
| 23 Jun | Coffee House | £4.20 | OK |
| 22 Jun | Streaming Co. | £12.99 | OK |

If you don't recognise the **£89.99** charge, here's what we'll do:

- [x] Freeze the affected card
- [ ] Dispute the transaction
- [ ] Issue a replacement card

> ⚠️ **Never** share your one-time passcode — Bank AI will never ask for it.

Want me to start a dispute? You can also [report fraud here](https://example.com/report-fraud).`,

  insights: `### Your financial insights

I keep an eye on your money and surface what matters. Right now I'm tracking:

| Insight | What's up |
| --- | --- |
| **Portfolio drift** | Your allocation has moved away from target |
| **Monthly spending** | You're trending 18% above last month |
| **Idle cash** | £8,500 could be working harder |

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

- *"Send £200 to Sam"*
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
  { "label": "Trim equities", "detail": "Sell ~£4,200 to lock in recent gains" },
  { "label": "Top up bonds", "detail": "Restore your income buffer" },
  { "label": "Set quarterly auto-rebalance", "detail": "Keeps your mix on target automatically" }
], "cta": { "label": "Prepare these trades for review" } }
\`\`\`

> ⚖️ Rebalancing now keeps your risk in line with your plan.

Want me to prepare these trades for your review?

\`\`\`bank:suggestions
{ "items": [
  { "kind": "prompt", "label": "Prepare the trades", "send": "Prepare these trades for review" },
  { "kind": "prompt", "label": "Why did it drift?" },
  { "kind": "link", "label": "View full portfolio", "url": "https://example.com/portfolio" }
] }
\`\`\``,

  'Spending this month': `### Spending this month

You've spent **£2,140** so far — :hl[18% more]{tone=warning} than the same point last month. Here's where it went:

| Category | This month | vs. last |
| --- | ---: | ---: |
| Dining & takeaway | £540 | 🔺 +32% |
| Groceries | £410 | +4% |
| Transport | £320 | 🔺 +21% |
| Subscriptions | £180 | +0% |
| Shopping | £690 | 🔺 +27% |

A few things stand out:

- **Dining** is your fastest-growing category
- You have **£180/mo** in subscriptions — I can flag any unused ones

> 💡 Setting a £600 dining budget would put you back on last month's pace.

Want me to set up category budgets or review your subscriptions?`,

  'Idle cash': `### Idle cash

You're holding :hl[£8,500]{tone=positive} in checking earning just **0.1%**. Before I suggest where it should go, let's tailor it to what you actually want this money to do.

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
  { "kind": "prompt", "label": "Open easy-access savings", "send": "Open an easy-access savings account and move £6,500" },
  { "kind": "link", "label": "Compare rates", "url": "https://example.com/savings" }
] }
\`\`\``

// Post-submission replies, keyed by the first answer (the "aim" option label).
const wizardReplies: Record<string, string> = {
  'Grow my wealth': `### A plan for growth

Thanks — that helps. With growth as your aim, a **stocks & shares ISA** fits well: historically it's outpaced cash over longer horizons, though values can fall as well as rise.

- Keep ~£2,000 in easy-access as a buffer
- Invest the rest in a diversified, low-cost fund
- Automate a monthly top-up to smooth out the ups and downs

> 📈 Time *in* the market tends to matter more than timing it.`,

  'Save for retirement': `### Building your retirement pot

A retirement aim usually means a longer runway, so tax-efficient wrappers do the heavy lifting. Topping up a **pension** (with tax relief) or a **stocks & shares ISA** could turn this idle cash into meaningful future income.

- Check whether you've used this year's pension allowance
- Consider a low-cost global fund for the long term
- Revisit the mix as retirement gets closer`,

  'Buy a home': `### Saving toward your home

For a deposit, certainty matters more than chasing returns. A **Lifetime ISA** (25% government bonus, up to £1,000/yr) or a top **fixed-rate saver** keeps the money safe while it grows.

- Lock away what you won't need before completion
- Keep the rest instant-access for flexibility`,

  'Keep a rainy-day buffer': `### A stronger safety net

Smart instinct — a rainy-day buffer should stay **instant-access**. But it shouldn't sit at 0.1%: moving it to **easy-access savings** earns roughly :hl[£280 more a year]{tone=positive} with no lock-in.

> 💰 Same money, same access — just a better rate.`,

  default: `### Here's what I'd suggest

Based on your answers, the simplest win is moving most of this idle cash into **easy-access savings** — roughly :hl[£280 more a year]{tone=positive}, with instant access kept for emergencies.`,
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

  http.post('/api/chat', async ({ request }) => {
    const { threadId, message } = (await request.json()) as {
      threadId: ThreadId
      message: string
    }
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
