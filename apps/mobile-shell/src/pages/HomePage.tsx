import { useState } from 'react'
import { AppShell } from '../components/AppShell'
import { useAuthStore } from '../store/authStore'
import { useDashboard } from '../hooks/useDashboard'
import { DashboardHeader } from '../components/dashboard/DashboardHeader'
import { RemoteWidget } from '../components/RemoteWidget'
import { QuickActions } from '../components/dashboard/QuickActions'
import { TotalAssets } from '../components/dashboard/TotalAssets'
import { BankingSummaryCard } from '../components/dashboard/BankingSummaryCard'
import { AccountAccordion } from '../components/dashboard/AccountAccordion'
import { DashboardSkeleton } from '../components/dashboard/DashboardSkeleton'

export function HomePage() {
  const user = useAuthStore((s) => s.user)
  const { data, isPending, isError, refetch } = useDashboard()
  const [balancesHidden, setBalancesHidden] = useState(false)

  const name = data?.greetingName ?? user?.name?.split(' ')[0] ?? 'there'

  return (
    <AppShell>
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
            <RemoteWidget name="promoCarousel" />
          </div>

          <div className="animate-float-in [animation-delay:120ms]">
            <QuickActions actions={data.quickActions} />
          </div>

          {/* Assets: total + AI summary + expandable accounts, one glass card. */}
          <div className="glass animate-float-in overflow-hidden rounded-3xl [animation-delay:180ms]">
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
    </AppShell>
  )
}
