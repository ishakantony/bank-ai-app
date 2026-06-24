import { TrendingUp, Wallet, Coins, type LucideIcon } from 'lucide-react'
import type { Insight, InsightTone } from '../../types'

const ICONS: Record<Insight['icon'], LucideIcon> = {
  portfolio: TrendingUp,
  spending: Wallet,
  idleCash: Coins,
}

/** Tailwind classes per semantic tone: tinted card + colored, background-less icon. */
const TONES: Record<
  InsightTone,
  { card: string; icon: string }
> = {
  amber: {
    card: 'border-amber-400/25 bg-amber-400/[0.08] hover:border-amber-400/45 hover:bg-amber-400/[0.12] hover:shadow-[0_8px_40px_-12px_rgba(251,191,36,0.45)] focus-visible:ring-amber-400/70',
    icon: 'text-amber-300',
  },
  blue: {
    card: 'border-blue-400/25 bg-blue-400/[0.08] hover:border-blue-400/45 hover:bg-blue-400/[0.12] hover:shadow-[0_8px_40px_-12px_rgba(96,165,250,0.45)] focus-visible:ring-blue-400/70',
    icon: 'text-blue-300',
  },
  green: {
    card: 'border-emerald-400/25 bg-emerald-400/[0.08] hover:border-emerald-400/45 hover:bg-emerald-400/[0.12] hover:shadow-[0_8px_40px_-12px_rgba(52,211,153,0.45)] focus-visible:ring-emerald-400/70',
    icon: 'text-emerald-300',
  },
}

interface InsightCardProps {
  insight: Insight
  onSelect: (insight: Insight) => void
}

/** Full-width insight tile: title + description left, plain colored icon top-right. */
export function InsightCard({ insight, onSelect }: InsightCardProps) {
  const Icon = ICONS[insight.icon]
  const tone = TONES[insight.tone]

  return (
    <button
      type="button"
      onClick={() => onSelect(insight)}
      className={`group flex w-full items-start justify-between gap-4 rounded-2xl border p-4 text-left backdrop-blur-md transition duration-300 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 ${tone.card}`}
    >
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-white">
          {insight.title}
        </span>
        <span className="mt-1 block text-xs leading-snug text-white/55">
          {insight.description}
        </span>
      </span>
      <Icon
        className={`size-5 shrink-0 transition-transform duration-300 group-hover:scale-110 ${tone.icon}`}
        strokeWidth={2}
      />
    </button>
  )
}
