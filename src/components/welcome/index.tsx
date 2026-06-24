import type { FC } from 'react'
import { useTopics } from '../../hooks/useTopics'
import type { TopicId } from '../../types'
import type { WelcomeProps } from './types'
import { TransferWelcome } from './TransferWelcome'
import { CardServicesWelcome } from './CardServicesWelcome'
import { SavingsWelcome } from './SavingsWelcome'
import { SecurityWelcome } from './SecurityWelcome'
import { InsightsWelcome } from './InsightsWelcome'
import { GenericWelcome } from './GenericWelcome'

// Bespoke layout per topic; anything missing falls back to GenericWelcome.
const WELCOME: Partial<Record<TopicId, FC<WelcomeProps>>> = {
  transfer: TransferWelcome,
  cards: CardServicesWelcome,
  savings: SavingsWelcome,
  security: SecurityWelcome,
  insights: InsightsWelcome,
}

interface WelcomeScreenProps {
  topicId: TopicId
  onSend: (text: string) => void
}

/** Resolves the topic's welcome layout, fetching topic data if needed. */
export function WelcomeScreen({ topicId, onSend }: WelcomeScreenProps) {
  const { data } = useTopics()
  const topic = data?.find((t) => t.id === topicId)

  if (!topic) {
    return (
      <div className="flex flex-1 items-center justify-center py-10">
        <div className="size-10 animate-pulse rounded-full bg-white/10" />
      </div>
    )
  }

  const Component = WELCOME[topicId] ?? GenericWelcome
  return <Component topic={topic} onSend={onSend} />
}
