import {
  ArrowLeftRight,
  CreditCard,
  PiggyBank,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import type { Topic } from '@bank-poc/shared'

const ICONS: Record<Topic['icon'], LucideIcon> = {
  transfer: ArrowLeftRight,
  card: CreditCard,
  savings: PiggyBank,
  security: ShieldCheck,
  insights: Sparkles,
}

interface TopicCardProps {
  topic: Topic
  onSelect: (topic: Topic) => void
}

export function TopicCard({ topic, onSelect }: TopicCardProps) {
  const Icon = ICONS[topic.icon]

  return (
    <button
      type="button"
      onClick={() => onSelect(topic)}
      className="group flex flex-col gap-2.5 rounded-2xl border border-white/10 bg-white/5 p-3.5 text-left backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.08] hover:shadow-[0_8px_40px_-12px_rgba(150,120,255,0.5)] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-1/70"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-accent-1/25 to-accent-3/25 text-white ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-110">
        <Icon className="size-[18px]" strokeWidth={1.75} />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-white">
          {topic.name}
        </span>
        <span className="mt-0.5 line-clamp-2 block text-xs leading-snug text-white/55">
          {topic.description}
        </span>
      </span>
    </button>
  )
}
