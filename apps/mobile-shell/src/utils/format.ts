const MYR = new Intl.NumberFormat('en-MY', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const MYR_WHOLE = new Intl.NumberFormat('en-MY', {
  maximumFractionDigits: 0,
})

/**
 * Format a MYR amount as `RMx,xxx.xx` (RM prefix, no space) per the house style.
 * Pass `whole` for grouped figures with no decimals (e.g. donut legends).
 */
export function formatRM(value: number, opts?: { whole?: boolean }): string {
  return `RM${(opts?.whole ? MYR_WHOLE : MYR).format(value)}`
}

/** Time-of-day greeting + emoji, matching the reference's "Morning ☀️". */
export function getGreeting(date = new Date()): { label: string; emoji: string } {
  const h = date.getHours()
  if (h < 12) return { label: 'Morning', emoji: '☀️' }
  if (h < 18) return { label: 'Afternoon', emoji: '🌤️' }
  return { label: 'Evening', emoji: '🌙' }
}
