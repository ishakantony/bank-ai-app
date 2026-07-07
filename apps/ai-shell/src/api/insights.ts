import type { Insight } from '@bank-poc/shared'
import { apiFetch } from './http'

export async function fetchInsights(): Promise<Insight[]> {
  const res = await apiFetch('/api/insights')
  if (!res.ok) {
    throw new Error(`Failed to load insights (${res.status})`)
  }
  return (await res.json()) as Insight[]
}
