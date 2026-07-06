import { Sparkles } from 'lucide-react'
import type { SpendInsight } from './types'
import { Donut } from './Donut'

// Bright ring colors that pop on the deep-blue card.
const RING = ['#5fe3ff', '#b79bff', '#74e6a6', '#ffd36b']

const MYR_WHOLE = new Intl.NumberFormat('en-MY', { maximumFractionDigits: 0 })

/** Format a whole MYR amount as `RMx,xxx` (RM prefix, no space) per house style. */
function formatRM(value: number): string {
  return `RM${MYR_WHOLE.format(value)}`
}

export function InsightHeroCard({ insight }: { insight: SpendInsight }) {
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-gradient-to-bl from-brand-2 via-brand-1 to-brand-deep p-5 text-white">
      {/* Decorative interior glow */}
      <div className="pointer-events-none absolute -right-10 -top-12 size-40 rounded-full bg-white/15 blur-2xl" />

      <div className="relative flex flex-1 items-start gap-4">
        <p className="flex-1 text-[15px] leading-relaxed text-white/90">
          You spent{' '}
          <span className="num font-semibold text-[#8dfcb8]">
            {formatRM(insight.amount)}
          </span>{' '}
          in {insight.month} — {insight.blurb}
        </p>
        <Donut slices={insight.donut} colors={RING} caption={insight.month} />
      </div>

      <div className="relative mt-4 flex justify-end">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full bg-ink/85 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-ink active:scale-[0.98]"
        >
          Full Insight
          <Sparkles className="size-4 text-brand-3" strokeWidth={2.2} />
        </button>
      </div>
    </div>
  )
}
