import type { ReactNode } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import type { SpendDonutData } from './schema'
import { ACCENTS } from '../colors'

/** Tailwind text colour per badge tone; defaults to warning (amber). */
const TONE_TEXT: Record<NonNullable<SpendDonutData['vsAvgTone']>, string> = {
  positive: 'text-tone-positive',
  negative: 'text-tone-negative',
  warning: 'text-tone-warning',
  info: 'text-tone-info',
}

/**
 * Spending overview ring: two hero stats (total spend + transaction count, each
 * with an optional "vs AVG" badge) above a donut whose centre carries the month
 * name and whose categories are splayed left/right with dashed leader lines.
 * Slice colours cycle `ACCENTS`; each label's percent is tinted to match its
 * slice. Falls back gracefully — extra categories just stack within their side.
 */
export default function SpendDonut({ data }: { data: SpendDonutData }) {
  const currency = data.currency ?? 'RM'
  const toneText = TONE_TEXT[data.vsAvgTone ?? 'warning']
  const total = data.categories.reduce((sum, c) => sum + c.amount, 0) || 1

  // Decorate each category with its slice colour + resolved percent (keeping the
  // donut order so cell colours and labels line up), then split into sides.
  const decorated = data.categories.map((cat, i) => ({
    ...cat,
    color: ACCENTS[i % ACCENTS.length],
    pct: cat.percent ?? Math.round((cat.amount / total) * 100),
  }))

  const left: typeof decorated = []
  const right: typeof decorated = []
  for (const cat of decorated) {
    if (cat.side === 'left') left.push(cat)
    else if (cat.side === 'right') right.push(cat)
    // Auto-split the unpinned ones, alternating right→left to keep sides even.
    else (right.length <= left.length ? right : left).push(cat)
  }

  const fmt = (n: number) => `${currency}${n.toLocaleString('en-MY')}`

  return (
    <>
      <div className="mb-5 flex gap-10">
        <Stat label="Spend" toneText={toneText} badge={data.spendVsAvg}>
          <span className="text-base text-white/55">{currency}</span>
          {data.spend.toLocaleString('en-MY')}
        </Stat>
        <Stat label="Transactions" toneText={toneText} badge={data.txnVsAvg}>
          {data.transactions}
        </Stat>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1">
        <ul className="flex flex-col gap-5">
          {left.map((cat) => (
            <Label key={cat.label} side="left" cat={cat} amount={fmt(cat.amount)} />
          ))}
        </ul>

        <div className="relative h-32 w-32 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={decorated}
                dataKey="amount"
                nameKey="label"
                innerRadius="64%"
                outerRadius="100%"
                paddingAngle={2}
                stroke="none"
                isAnimationActive={false}
              >
                {decorated.map((cat) => (
                  <Cell key={cat.label} fill={cat.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <span className="absolute inset-0 grid place-items-center text-sm font-medium text-white/85">
            {data.month}
          </span>
        </div>

        <ul className="flex flex-col gap-5">
          {right.map((cat) => (
            <Label key={cat.label} side="right" cat={cat} amount={fmt(cat.amount)} />
          ))}
        </ul>
      </div>
    </>
  )
}

/** One hero stat: small label, large figure, optional tinted "vs AVG" chip. */
function Stat({
  label,
  badge,
  toneText,
  children,
}: {
  label: string
  badge?: string
  toneText: string
  children: ReactNode
}) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-white/50">
        {label}
      </p>
      <p className="text-2xl font-semibold tabular-nums text-glow-green">
        {children}
      </p>
      {badge ? (
        <span
          className={`mt-1.5 inline-block rounded-md bg-white/5 px-2 py-0.5 text-[11px] font-medium ${toneText}`}
        >
          {badge}
        </span>
      ) : null}
    </div>
  )
}

/** A splayed category label with a dashed leader-line stub toward the ring. */
function Label({
  side,
  cat,
  amount,
}: {
  side: 'left' | 'right'
  cat: { label: string; color: string; pct: number }
  amount: string
}) {
  const text = (
    <div className={side === 'left' ? 'text-right' : 'text-left'}>
      <p className="text-base font-semibold leading-tight" style={{ color: cat.color }}>
        {cat.pct}%
      </p>
      <p className="text-[13px] leading-tight text-white/85">{cat.label}</p>
      <p className="text-xs leading-tight tabular-nums text-white/45">{amount}</p>
    </div>
  )
  const line = <span className="h-px w-3 shrink-0 border-t border-dashed border-white/25" />
  return (
    <li className="flex items-center gap-1.5">
      {side === 'left' ? (
        <>
          <span className="min-w-0 flex-1">{text}</span>
          {line}
        </>
      ) : (
        <>
          {line}
          <span className="min-w-0 flex-1">{text}</span>
        </>
      )}
    </li>
  )
}
