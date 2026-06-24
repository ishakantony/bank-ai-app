import { useTopics } from '../hooks/useTopics'
import type { Topic } from '../types'
import { TopicCard } from './TopicCard'

interface TopicGridProps {
  onSelect: (topic: Topic) => void
}

export function TopicGrid({ onSelect }: TopicGridProps) {
  const { data, isPending, isError, refetch } = useTopics()

  if (isError) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-sm text-white/60">
        Couldn&apos;t load topics.{' '}
        <button
          type="button"
          onClick={() => refetch()}
          className="font-medium text-accent-3 underline-offset-2 hover:underline"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {isPending
        ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        : data.map((topic) => (
            <TopicCard key={topic.id} topic={topic} onSelect={onSelect} />
          ))}
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="flex flex-col gap-2.5 rounded-2xl border border-white/10 bg-white/5 p-3.5">
      <div className="size-9 animate-pulse rounded-lg bg-white/10" />
      <div className="space-y-1.5">
        <div className="h-3.5 w-2/3 animate-pulse rounded bg-white/10" />
        <div className="h-3 w-full animate-pulse rounded bg-white/[0.07]" />
      </div>
    </div>
  )
}
