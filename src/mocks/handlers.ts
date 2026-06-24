import { http, HttpResponse, delay } from 'msw'
import type { ThreadId, Topic } from '../types'

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

What would you like to do first?`,
}

export const handlers = [
  http.get('/api/topics', async () => {
    // Artificial latency so the loading skeletons are visible.
    await delay(600)
    return HttpResponse.json(topics)
  }),

  http.post('/api/chat', async ({ request }) => {
    const { threadId } = (await request.json()) as { threadId: ThreadId }
    // Backend returns the full reply; streaming is faked client-side.
    await delay(700)
    return HttpResponse.json({ reply: replies[threadId] ?? replies.general })
  }),
]
