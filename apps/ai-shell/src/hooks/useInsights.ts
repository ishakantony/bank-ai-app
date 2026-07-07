import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { fetchInsights } from '../api/insights'

export function useInsights() {
  // Language in the key so a switch refetches with the new Accept-Language.
  const { i18n } = useTranslation()
  return useQuery({
    queryKey: ['insights', i18n.language],
    queryFn: fetchInsights,
    staleTime: 5 * 60 * 1000,
  })
}
