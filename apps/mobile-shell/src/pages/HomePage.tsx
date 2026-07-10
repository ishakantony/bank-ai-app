import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { useDashboard } from '../hooks/useDashboard'
import { DashboardHeader } from '../components/dashboard/DashboardHeader'
import { RemoteWidget } from '../components/RemoteWidget'
import { QuickActions } from '../components/dashboard/QuickActions'
import { TotalAssets } from '../components/dashboard/TotalAssets'
import { BankingSummaryCard } from '../components/dashboard/BankingSummaryCard'
import { AccountAccordion } from '../components/dashboard/AccountAccordion'
import { DashboardSkeleton } from '../components/dashboard/DashboardSkeleton'

/**
 * Carousel-shaped placeholder shown while the promo-carousel remote's own JS
 * loads — before its internal `CarouselSkeleton` can mount. Mirrors that
 * skeleton's shape (full-bleed track re-inset with `px-4`, an `h-60` glass slab
 * + dot row) so mounting the real carousel doesn't shift layout.
 */
function CarouselSlotSkeleton() {
  return (
    <div className="px-4">
      <div className="glass h-60 w-full animate-pulse rounded-3xl" />
      <div className="mt-3 flex justify-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full bg-ink-soft/30 ${i === 0 ? 'w-5' : 'w-1.5'}`}
          />
        ))}
      </div>
    </div>
  )
}

export function HomePage() {
  const user = useAuthStore((s) => s.user)
  const { data, isPending, isError, refetch } = useDashboard()
  const [balancesHidden, setBalancesHidden] = useState(false)

  const name = data?.greetingName ?? user?.name?.split(' ')[0] ?? 'there'

  return (
    <>
      <DashboardHeader name={name} />

      {isPending ? (
        <div className="mt-6">
          <DashboardSkeleton />
        </div>
      ) : isError ? (
        <div className="mt-10 flex flex-col items-center text-center">
          <p className="text-sm text-ink-soft">Couldn’t load your dashboard.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-3 rounded-full bg-brand-1 px-4 py-2 text-sm font-semibold text-white"
          >
            Try again
          </button>
        </div>
      ) : (
        <div className="mt-5 space-y-6">
          {/* The promo carousel is a self-fetching federated widget: the shell
              just mounts it and knows nothing about promo/insight data. */}
          {/* -mx-4 cancels AppShell's px-4 so the carousel scroll track is full-bleed;
              the remote re-adds the inset inside its own scroller so cards stay aligned. */}
          <div className="animate-float-in -mx-4">
            <RemoteWidget name="promoCarousel" fallback={<CarouselSlotSkeleton />} />
          </div>

          <div className="animate-float-in [animation-delay:120ms]">
            <QuickActions actions={data.quickActions} />
          </div>

          {/* Assets: total + AI summary + expandable accounts, one glass card.
              We drop `.glass`'s 1px layout border here so the highlighted
              summary band bleeds full-width to the card edge (overflow-hidden
              otherwise clips children to inside the border, revealing a white
              hairline beside the tinted band). Definition comes from the drop
              shadow + inset top highlight instead. */}
          <div
            className="glass animate-float-in overflow-hidden rounded-3xl [animation-delay:180ms]"
            style={{
              border: 'none',
              boxShadow:
                '0 12px 40px -18px oklch(0.4 0.09 262 / 0.35), inset 0 1px 0 0 oklch(1 0 0 / 0.6)',
            }}
          >
            <TotalAssets
              amount={data.totalAssets}
              hidden={balancesHidden}
              onToggle={() => setBalancesHidden((h) => !h)}
            />
            <div className="border-t border-ink-soft/10" />
            <BankingSummaryCard />
            <div className="border-t border-ink-soft/10" />
            <AccountAccordion
              accounts={data.accounts}
              hidden={balancesHidden}
            />
          </div>
        </div>
      )}
    </>
  )
}
