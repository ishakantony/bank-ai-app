import {
  Car,
  Clapperboard,
  ReceiptText,
  ShoppingBag,
  Utensils,
  Wallet,
  ArrowLeftRight,
  type LucideIcon,
} from 'lucide-react'
import type { SpendBreakdownData } from '@bank-ai/shared'
import { ACCENTS } from '@bank-ai/blocks-kit'

/**
 * Category icons, keyed by the `icon` string in the block data. Extend this map
 * (and reference the new key from a reply) to add a category glyph; anything
 * unknown falls back to the wallet.
 */
const ICONS: Record<string, LucideIcon> = {
  dining: Utensils,
  shopping: ShoppingBag,
  transport: Car,
  transfer: ArrowLeftRight,
  bills: ReceiptText,
  entertainment: Clapperboard,
  others: Wallet,
}

/** Tailwind text colour for the per-row delta, by tone. */
const DELTA_TEXT: Record<
  NonNullable<SpendBreakdownData['categories'][number]['deltaTone']>,
  string
> = {
  positive: 'text-tone-positive',
  negative: 'text-tone-negative',
  warning: 'text-glow-warm',
  info: 'text-tone-info',
  flat: 'text-white/40',
}

/** Infer a delta tone from its text when none is given: +→up (amber), −→down (green). */
function inferTone(delta?: string): keyof typeof DELTA_TEXT {
  if (!delta) return 'flat'
  const t = delta.trim()
  if (t.startsWith('+')) return 'warning'
  if (t.startsWith('-') || t.startsWith('−')) return 'positive'
  return 'flat'
}

/**
 * Detailed spending breakdown: a header (period total + a "vs avg" badge) over a
 * list of category rows. Each row pairs an icon tile, label + percent, a coloured
 * progress bar (cycling `ACCENTS`), the amount, and a tone-coloured delta vs the
 * usual rhythm — an increase reads amber, a decrease green, flat is muted.
 */
export default function SpendBreakdown({ data }: { data: SpendBreakdownData }) {
  const currency = data.currency ?? 'RM'
  const fmt = (n: number) => `${currency}${n.toLocaleString('en-MY')}`

  return (
    <>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-white/50">
            {data.title ?? 'Spending breakdown'}
          </p>
          <p className="text-2xl font-semibold tabular-nums text-glow-green">
            <span className="text-base text-white/55">{currency}</span>
            {data.total.toLocaleString('en-MY')}
          </p>
        </div>
        {data.vsAvg ? (
          <div className="text-right">
            <span className="inline-block rounded-md bg-white/5 px-2 py-0.5 text-[11px] font-medium text-tone-warning">
              {data.vsAvg}
            </span>
            {data.vsAvgLabel ? (
              <p className="mt-1 text-[11px] text-white/45">{data.vsAvgLabel}</p>
            ) : null}
          </div>
        ) : null}
      </div>

      <ul className="space-y-3">
        {data.categories.map((cat, i) => {
          const Icon = (cat.icon && ICONS[cat.icon]) || Wallet
          const color = ACCENTS[i % ACCENTS.length]
          const tone = cat.deltaTone ?? inferTone(cat.delta)
          return (
            <li key={cat.label} className="flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/[0.08] text-white/80 ring-1 ring-white/10">
                <Icon className="size-5" strokeWidth={1.75} />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="truncate text-sm font-medium text-white/90">
                    {cat.label}
                  </span>
                  <span className="text-xs tabular-nums text-white/45">
                    {cat.percent}%
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${cat.percent}%`, backgroundColor: color }}
                  />
                </div>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold tabular-nums text-white/90">
                  {fmt(cat.amount)}
                </p>
                {cat.delta ? (
                  <p className={`text-xs font-medium tabular-nums ${DELTA_TEXT[tone]}`}>
                    {cat.delta}
                  </p>
                ) : null}
              </div>
            </li>
          )
        })}
      </ul>
    </>
  )
}
