import type { Insight } from '../types'

export async function fetchInsights(): Promise<Insight[]> {
  const res = await fetch('/api/insights')
  if (!res.ok) {
    throw new Error(`Failed to load insights (${res.status})`)
  }
  return (await res.json()) as Insight[]
}
