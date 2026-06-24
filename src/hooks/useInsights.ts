import { useQuery } from '@tanstack/react-query'
import { fetchInsights } from '../api/insights'

export function useInsights() {
  return useQuery({
    queryKey: ['insights'],
    queryFn: fetchInsights,
    staleTime: 5 * 60 * 1000,
  })
}
