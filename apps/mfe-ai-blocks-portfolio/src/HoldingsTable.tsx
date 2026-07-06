import {
  Banknote,
  Building2,
  CandlestickChart,
  Landmark,
  PiggyBank,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import type { HoldingsTableData } from '@bank-poc/shared'
import { BlockCard, ACCENTS } from '@bank-poc/blocks-kit'

/**
 * Holding icons, keyed by the `category` string in the block data. Extend this
 * map (and reference the new key from a reply) to add a glyph; anything unknown
 * falls back to the wallet.
 */
const ICONS: Record<string, LucideIcon> = {
  epf: Landmark,
  prs: PiggyBank,
  asb: Building2,
  unitTrust: Banknote,
  stocks: CandlestickChart,
  cash: Wallet,
}

/** Tailwind text colour for the per-row return, by tone. */
const RETURN_TEXT: Record<
  NonNullable<HoldingsTableData['holdings'][number]['returnTone']>,
  string
> = {
  positive: 'text-tone-positive',
  negative: 'text-tone-negative',
  flat: 'text-white/40',
}

/** Infer a return tone from its value when none is given. */
function inferTone(pct?: number): keyof typeof RETURN_TEXT {
  if (pct === undefined || pct === 0) return 'flat'
  return pct > 0 ? 'positive' : 'negative'
}

/**
 * Holdings table: a header (title + combined value) over a list of rows. Each
 * row pairs a category icon tile (accent-tinted, cycling `ACCENTS`), the
 * holding name, its value, and a tone-coloured return — a gain reads green, a
 * loss red, flat is muted.
 */
export default function HoldingsTable({ data }: { data: HoldingsTableData }) {
  const currency = data.currency ?? 'RM'
  const fmt = (n: number) => `${currency}${n.toLocaleString('en-MY')}`

  return (
    <BlockCard>
      <div className="mb-4">
        <p className="text-[11px] font-medium uppercase tracking-wide text-white/50">
          {data.title ?? 'Holdings'}
        </p>
        {data.total !== undefined ? (
          <p className="text-2xl font-semibold tabular-nums text-glow-green">
            <span className="text-base text-white/55">{currency}</span>
            {data.total.toLocaleString('en-MY')}
          </p>
        ) : null}
      </div>

      <ul className="space-y-3">
        {data.holdings.map((holding, i) => {
          const Icon = (holding.category && ICONS[holding.category]) || Wallet
          const color = ACCENTS[i % ACCENTS.length]
          const tone = holding.returnTone ?? inferTone(holding.returnPct)
          const sign =
            (holding.returnPct ?? 0) > 0
              ? '+'
              : (holding.returnPct ?? 0) < 0
                ? '−'
                : ''
          return (
            <li key={holding.name} className="flex items-center gap-3">
              <span
                className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/[0.08] ring-1 ring-white/10"
                style={{ color }}
              >
                <Icon className="size-5" strokeWidth={1.75} />
              </span>

              <div className="min-w-0 flex-1">
                <span className="truncate text-sm font-medium text-white/90">
                  {holding.name}
                </span>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold tabular-nums text-white/90">
                  {fmt(holding.value)}
                </p>
                {holding.returnPct !== undefined ? (
                  <p
                    className={`text-xs font-medium tabular-nums ${RETURN_TEXT[tone]}`}
                  >
                    {sign}
                    {Math.abs(holding.returnPct).toLocaleString('en-MY')}%
                  </p>
                ) : null}
              </div>
            </li>
          )
        })}
      </ul>
    </BlockCard>
  )
}
