import { formatRM } from '../utils/format'

interface MoneyProps {
  amount: number
  hidden?: boolean
  /** Sizing/weight classes for the number. */
  className?: string
  /** Mask length when hidden (visual only). */
  maskWidth?: 4 | 6
}

/**
 * A currency amount rendered the way the reference does it: a smaller, muted
 * "RM" prefix next to a bold, tabular number. When hidden, the whole thing
 * collapses to a dotted mask.
 */
export function Money({
  amount,
  hidden,
  className = '',
  maskWidth = 6,
}: MoneyProps) {
  if (hidden) {
    // Color inherits from the caller (default: body ink) so callers can mute it.
    return (
      <span className={`num font-semibold ${className}`}>
        RM{'•'.repeat(maskWidth)}
      </span>
    )
  }
  // formatRM prefixes "RM"; split it off so we can style the prefix separately.
  const number = formatRM(amount).slice(2)
  return (
    <span className={`num font-semibold ${className}`}>
      <span className="mr-0.5 align-[0.08em] text-[0.62em] font-semibold text-ink-soft">
        RM
      </span>
      {number}
    </span>
  )
}
