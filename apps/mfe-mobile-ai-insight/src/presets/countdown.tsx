import { z } from 'zod'
import { baseCardSchema } from '../schema'
import { definePreset } from './types'

/**
 * `countdown` — a calendar countdown. An SVG calendar glyph (month band + day)
 * sits beside a big `count` + optional unit and caption. No chart lib. Good for
 * "N days until your card payment" or "N subscriptions renew on 25 Jul".
 */
const schema = baseCardSchema.extend({
  /** Short month shown in the calendar header, e.g. "JUL". */
  month: z.string(),
  /** Day of month shown on the calendar face, e.g. 25. */
  day: z.number().int(),
  /** The headline figure beside the calendar, e.g. days remaining or a tally. */
  count: z.number(),
  /** Unit beneath the count, e.g. "days" or "renewals". */
  unit: z.string().optional(),
  /** Caption beneath the count/unit, e.g. "until your card payment". */
  caption: z.string().optional(),
})

type Data = z.infer<typeof schema>

/** A little calendar page: mint header band with the month, big day below. */
function CalendarGlyph({ month, day }: { month: string; day: number }) {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
      {/* binder rings */}
      <line x1="34" y1="6" x2="34" y2="20" stroke="white" strokeWidth="5" strokeLinecap="round" />
      <line x1="66" y1="6" x2="66" y2="20" stroke="white" strokeWidth="5" strokeLinecap="round" />
      {/* page */}
      <rect x="14" y="14" width="72" height="76" rx="12" fill="white" />
      {/* header band */}
      <path d="M14 26 A12 12 0 0 1 26 14 H74 A12 12 0 0 1 86 26 V34 H14 Z" fill="var(--color-brand-1)" />
      <text x="50" y="28" textAnchor="middle" fontSize="13" fontWeight="700" fill="white" letterSpacing="1">
        {month.toUpperCase()}
      </text>
      <text
        x="50"
        y="72"
        textAnchor="middle"
        fontSize="40"
        fontWeight="800"
        fill="var(--color-brand-deep)"
      >
        {day}
      </text>
    </svg>
  )
}

function Countdown({ data, compact }: { data: Data; compact?: boolean }) {
  return (
    <div className="flex h-full w-full items-center gap-3">
      <div className={`shrink-0 self-center ${compact ? 'h-11' : 'h-16'}`} style={{ aspectRatio: '1 / 1' }}>
        <CalendarGlyph month={data.month} day={data.day} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="num font-semibold leading-none">
          <span className={compact ? 'text-2xl' : 'text-3xl'}>{data.count}</span>
          {data.unit ? (
            <span className={`ml-1 text-white/60 ${compact ? 'text-[11px]' : 'text-sm'}`}>
              {data.unit}
            </span>
          ) : null}
        </p>
        {data.caption ? (
          <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-white/70">
            {data.caption}
          </p>
        ) : null}
      </div>
    </div>
  )
}

export default definePreset({
  schema,
  Visual: ({ data, variant }) => (
    <Countdown data={data} compact={variant === 'compact' || variant === 'wide'} />
  ),
})
