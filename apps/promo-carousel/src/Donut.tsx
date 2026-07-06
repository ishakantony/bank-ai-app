import type { DonutSlice } from './types'

interface DonutProps {
  slices: DonutSlice[]
  colors: string[]
  size?: number
  thickness?: number
  /** Centered label above/below the value (e.g. "May"). */
  caption?: string
}

// r chosen so the circumference is ~100 → dasharray values read as percentages.
const R = 15.9155

/**
 * A lightweight SVG donut (no charting lib). Slices are drawn as dash segments
 * around a single circle, offset cumulatively. Used on the insight hero card.
 */
export function Donut({
  slices,
  colors,
  size = 92,
  thickness = 10,
  caption,
}: DonutProps) {
  const total = slices.reduce((sum, s) => sum + s.value, 0) || 1
  let offset = 0

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg viewBox="0 0 36 36" className="size-full -rotate-90">
        <circle
          cx="18"
          cy="18"
          r={R}
          fill="none"
          stroke="rgba(255,255,255,0.16)"
          strokeWidth={thickness}
        />
        {slices.map((slice, i) => {
          const pct = (slice.value / total) * 100
          const seg = (
            <circle
              key={slice.label}
              cx="18"
              cy="18"
              r={R}
              fill="none"
              stroke={colors[i % colors.length]}
              strokeWidth={thickness}
              strokeDasharray={`${pct} ${100 - pct}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
            />
          )
          offset += pct
          return seg
        })}
      </svg>
      {caption ? (
        <div className="absolute inset-0 grid place-items-center">
          <span className="text-[11px] font-semibold text-white/90">
            {caption}
          </span>
        </div>
      ) : null}
    </div>
  )
}
