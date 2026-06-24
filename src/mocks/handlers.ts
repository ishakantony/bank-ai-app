import { http, HttpResponse, delay } from 'msw'
import type { Topic } from '../types'

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

export const handlers = [
  http.get('/api/topics', async () => {
    // Artificial latency so the loading skeletons are visible.
    await delay(600)
    return HttpResponse.json(topics)
  }),
]
