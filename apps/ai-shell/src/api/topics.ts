import type { Topic } from '@bank-poc/shared'

export async function fetchTopics(): Promise<Topic[]> {
  const res = await fetch('/api/topics')
  if (!res.ok) {
    throw new Error(`Failed to load topics (${res.status})`)
  }
  return (await res.json()) as Topic[]
}
