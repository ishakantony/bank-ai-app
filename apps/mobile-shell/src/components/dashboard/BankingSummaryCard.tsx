import { Sparkles, ChevronRight } from 'lucide-react'

const AI_SHELL_URL = import.meta.env.VITE_AI_SHELL_URL ?? 'http://localhost:9999'

const PORTFOLIO_DEEPLINK =
  `${AI_SHELL_URL}/chat?topic=insights&` +
  `message=${encodeURIComponent('Your investment portfolio needs rebalancing')}`

/** Highlighted "AI summary" row inside the assets card. */
export function BankingSummaryCard() {
  return (
    <button
      type="button"
      onClick={() => window.open(PORTFOLIO_DEEPLINK, '_blank', 'noopener,noreferrer')}
      className="flex w-full items-center gap-3 bg-gradient-to-r from-brand-1/10 to-brand-3/10 px-5 py-3.5 text-left transition hover:from-brand-1/15 hover:to-brand-3/15"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-1 to-brand-2 text-white shadow-[0_8px_18px_-8px_var(--color-brand-2)]">
        <Sparkles className="size-[18px]" strokeWidth={2} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink">Your Banking Summary</p>
        <p className="truncate text-xs text-ink-soft">
          Personalised financial intelligence
        </p>
      </div>
      <ChevronRight className="size-4 shrink-0 text-brand-1" strokeWidth={2.2} />
    </button>
  )
}
