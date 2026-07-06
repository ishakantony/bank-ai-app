import { Sparkles } from 'lucide-react'

const LABELS: Record<string, string> = {
  payments: 'Payments',
  invest: 'Invest & Insure',
  discover: 'Discover',
  services: 'Services',
}

/** Stub screen for the not-yet-built bottom-nav tabs, kept inside the shell so
 *  navigation (and the guard) stays functional. */
export function PlaceholderPage({ tab }: { tab: string }) {
  const label = LABELS[tab] ?? 'Coming soon'
  return (
    <div className="flex min-h-[70dvh] flex-col items-center justify-center text-center">
      <div className="glass mb-5 grid size-16 place-items-center rounded-3xl text-brand-1">
        <Sparkles className="size-7" strokeWidth={2} />
      </div>
      <h1 className="font-display text-2xl font-semibold text-ink">{label}</h1>
      <p className="mt-2 max-w-xs text-sm text-ink-soft">
        This experience is on its way. In a real build, a federated {label}{' '}
        module would load right here.
      </p>
    </div>
  )
}
