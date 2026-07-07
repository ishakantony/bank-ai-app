import type { Topic } from '@bank-poc/shared'
import { apiFetch } from './http'

export async function fetchTopics(): Promise<Topic[]> {
  const res = await apiFetch('/api/topics')
  if (!res.ok) {
    throw new Error(`Failed to load topics (${res.status})`)
  }
  return (await res.json()) as Topic[]
}
