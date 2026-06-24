import { ChevronRight } from 'lucide-react'
import type { ActionCardData } from './schemas'
import { BlockCard } from './BlockCard'

/**
 * A reusable suggested-actions card: a list of tappable rows plus an optional
 * primary CTA. Generic across insights — there's no backend yet, so selecting a
 * row or the CTA just logs (mirrors the rest of the app's local-only behaviour).
 */
export default function ActionCard({ data }: { data: ActionCardData }) {
  return (
    <BlockCard title={data.title ?? 'Suggested actions'}>
      <ul className="-mx-1 space-y-0.5">
        {data.actions.map((action) => (
          <li key={action.label}>
            <button
              type="button"
              onClick={() => console.log('[actionCard] action', action.label)}
              className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-white/5"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-medium text-white/90">
                  {action.label}
                </span>
                {action.detail ? (
                  <span className="block text-[12px] text-white/55">
                    {action.detail}
                  </span>
                ) : null}
              </span>
              <ChevronRight className="size-4 shrink-0 text-white/35" />
            </button>
          </li>
        ))}
      </ul>

      {data.cta ? (
        <button
          type="button"
          onClick={() => console.log('[actionCard] cta', data.cta?.label)}
          className="mt-3 w-full rounded-xl bg-gradient-to-br from-accent-1 to-accent-2 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.01] active:scale-100"
        >
          {data.cta.label}
        </button>
      ) : null}
    </BlockCard>
  )
}
