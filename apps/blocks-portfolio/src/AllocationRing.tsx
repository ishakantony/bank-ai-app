import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import type { AllocationRingData } from '@bank-ai/shared'
import { BlockCard, ACCENTS } from '@bank-ai/blocks-kit'

/**
 * Asset-allocation ring: a donut whose centre carries the combined total and
 * whose slices (asset classes) are splayed left/right with dashed leader lines.
 * Slice colours cycle `ACCENTS`; each label's percent is tinted to match its
 * slice and defaults to its share of the total. Extra slices just stack within
 * their side.
 */
export default function AllocationRing({ data }: { data: AllocationRingData }) {
  const currency = data.currency ?? 'RM'
  const total =
    (data.total ?? data.slices.reduce((sum, s) => sum + s.value, 0)) || 1

  // Decorate each slice with its colour + resolved percent (keeping the ring
  // order so cell colours and labels line up), then split into sides.
  const decorated = data.slices.map((slice, i) => ({
    ...slice,
    color: ACCENTS[i % ACCENTS.length],
    pct: slice.percent ?? Math.round((slice.value / total) * 100),
  }))

  const left: typeof decorated = []
  const right: typeof decorated = []
  for (const slice of decorated) {
    if (slice.side === 'left') left.push(slice)
    else if (slice.side === 'right') right.push(slice)
    // Auto-split the unpinned ones, alternating right→left to keep sides even.
    else (right.length <= left.length ? right : left).push(slice)
  }

  const fmt = (n: number) => `${currency}${n.toLocaleString('en-MY')}`

  return (
    <BlockCard title={data.title === undefined ? 'Asset allocation' : data.title}>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1">
        <ul className="flex flex-col gap-5">
          {left.map((slice) => (
            <Label
              key={slice.label}
              side="left"
              slice={slice}
              amount={fmt(slice.value)}
            />
          ))}
        </ul>

        <div className="relative h-32 w-32 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={decorated}
                dataKey="value"
                nameKey="label"
                innerRadius="64%"
                outerRadius="100%"
                paddingAngle={2}
                stroke="none"
                isAnimationActive={false}
              >
                {decorated.map((slice) => (
                  <Cell key={slice.label} fill={slice.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <span className="absolute inset-0 grid place-items-center text-center text-xs font-medium leading-tight text-white/85">
            {fmt(total)}
          </span>
        </div>

        <ul className="flex flex-col gap-5">
          {right.map((slice) => (
            <Label
              key={slice.label}
              side="right"
              slice={slice}
              amount={fmt(slice.value)}
            />
          ))}
        </ul>
      </div>
    </BlockCard>
  )
}

/** A splayed slice label with a dashed leader-line stub toward the ring. */
function Label({
  side,
  slice,
  amount,
}: {
  side: 'left' | 'right'
  slice: { label: string; color: string; pct: number }
  amount: string
}) {
  const text = (
    <div className={side === 'left' ? 'text-right' : 'text-left'}>
      <p
        className="text-base font-semibold leading-tight"
        style={{ color: slice.color }}
      >
        {slice.pct}%
      </p>
      <p className="text-[13px] leading-tight text-white/85">{slice.label}</p>
      <p className="text-xs leading-tight tabular-nums text-white/45">{amount}</p>
    </div>
  )
  const line = (
    <span className="h-px w-3 shrink-0 border-t border-dashed border-white/25" />
  )
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
