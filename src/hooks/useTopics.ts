import { useQuery } from '@tanstack/react-query'
import { fetchTopics } from '../api/topics'

export function useTopics() {
  return useQuery({
    queryKey: ['topics'],
    queryFn: fetchTopics,
    staleTime: 5 * 60 * 1000,
  })
}
