import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { fetchTopics } from '../api/topics'

export function useTopics() {
  // Language is part of the key so a switch refetches with the new
  // Accept-Language header (react-i18next re-renders → new key → refetch).
  const { i18n } = useTranslation()
  return useQuery({
    queryKey: ['topics', i18n.language],
    queryFn: fetchTopics,
    staleTime: 5 * 60 * 1000,
  })
}
