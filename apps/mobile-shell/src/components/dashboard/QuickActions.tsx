import {
  Smartphone,
  Repeat,
  QrCode,
  Sparkles,
  ChevronDown,
  type LucideIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import type { QuickAction, QuickActionIcon } from '../../types'

const ICONS: Record<QuickActionIcon, LucideIcon> = {
  duitnow: Smartphone,
  exchange: Repeat,
  jompay: QrCode,
  ai: Sparkles,
  more: ChevronDown,
}

export function QuickActions({ actions }: { actions: QuickAction[] }) {
  return (
    <div className="flex items-start justify-between gap-1">
      {actions.map((action) => {
        const Icon = ICONS[action.icon]
        const isMore = action.icon === 'more'
        return (
          <button
            key={action.id}
            type="button"
            onClick={() => toast(`${action.label} is coming soon.`)}
            className="group flex flex-1 flex-col items-center gap-1.5"
          >
            <span
              className={`grid size-14 place-items-center rounded-2xl transition group-active:scale-95 ${
                isMore
                  ? 'border border-ink-soft/20 bg-white/70 text-ink-soft group-hover:border-brand-1/40 group-hover:text-brand-1'
                  : 'bg-brand-1 text-white shadow-[0_10px_22px_-12px_var(--color-brand-1)] group-hover:bg-brand-deep'
              }`}
            >
              <Icon className="size-6" strokeWidth={2} />
            </span>
            <span className="text-center text-[11px] font-medium leading-tight text-ink">
              {action.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
