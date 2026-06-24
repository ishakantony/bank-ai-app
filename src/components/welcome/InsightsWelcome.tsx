import { useInsights } from '../../hooks/useInsights'
import type { WelcomeProps } from './types'
import { InsightCard } from './InsightCard'

/** Insights — a "Your financial insights" hero over a column of insight tiles. */
export function InsightsWelcome({ onSend }: WelcomeProps) {
  const { data, isPending, isError, refetch } = useInsights()

  return (
    <div className="flex flex-col gap-6 py-8">
      <h2 className="animate-float-in text-3xl font-semibold text-white">
        Your financial insights
      </h2>

      {isError ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-sm text-white/60">
          Couldn&apos;t load insights.{' '}
          <button
            type="button"
            onClick={() => refetch()}
            className="font-medium text-accent-3 underline-offset-2 hover:underline"
          >
            Try again
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {isPending
            ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
            : data.map((insight, i) => (
                // Wrapper carries the staggered fade-up so it doesn't clash with
                // the card's own hover:-translate-y transform. Cards trail the
                // heading, then reveal one by one.
                <div
                  key={insight.id}
                  className="animate-float-in"
                  style={{ animationDelay: `${0.25 + i * 0.12}s` }}
                >
                  <InsightCard
                    insight={insight}
                    onSelect={(insight) => onSend(insight.title)}
                  />
                </div>
              ))}
        </div>
      )}
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-3.5 w-2/3 animate-pulse rounded bg-white/10" />
        <div className="h-3 w-full animate-pulse rounded bg-white/[0.07]" />
      </div>
      <div className="size-5 shrink-0 animate-pulse rounded bg-white/10" />
    </div>
  )
}
