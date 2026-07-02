import type { DashboardData } from '../types'

export async function fetchDashboard(): Promise<DashboardData> {
  const res = await fetch('/api/dashboard')
  if (!res.ok) {
    throw new Error(`Failed to load dashboard (${res.status})`)
  }
  return (await res.json()) as DashboardData
}
