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
  transfer:
    "Happy to help you move money. I can send funds to a saved payee, set up a new recipient, or check your transfer limits and arrival times. Who would you like to pay, and how much?",
  cards:
    "Let's sort out your cards. I can freeze or unfreeze a card instantly, order a replacement, or walk you through your spending controls. Which card are we talking about?",
  savings:
    "Great — let's grow those savings. I can open a goal, set up a recurring transfer, or project how long it'll take to reach a target. What are you saving for?",
  security:
    "Your security is the priority. I can review recent activity, lock your account, or help you report a suspicious transaction right away. What looks off to you?",
  general:
    "Hi! I'm Bank AI. I can help with transfers, cards, savings goals, and account security. Tell me what you'd like to do and I'll take it from there.",
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
