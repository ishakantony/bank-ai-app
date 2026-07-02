import { useState } from 'react'
import {
  Landmark,
  TrendingUp,
  CreditCard,
  HandCoins,
  ChevronDown,
  type LucideIcon,
} from 'lucide-react'
import type { Account, AccountIcon } from '../../types'
import { Money } from '../Money'

const ICONS: Record<AccountIcon, LucideIcon> = {
  deposits: Landmark,
  investments: TrendingUp,
  cards: CreditCard,
  loans: HandCoins,
}

// Colorful per-account accents, echoing the reference's varied category icons.
const ACCENT: Record<AccountIcon, { wrap: string; icon: string }> = {
  deposits: { wrap: 'bg-brand-1/10', icon: 'text-brand-1' },
  investments: { wrap: 'bg-tone-positive/12', icon: 'text-tone-positive' },
  cards: {
    wrap: 'bg-[oklch(0.55_0.2_300)]/12',
    icon: 'text-[oklch(0.55_0.2_300)]',
  },
  loans: { wrap: 'bg-tone-warning/15', icon: 'text-tone-warning' },
}

export function AccountAccordion({
  accounts,
  hidden,
}: {
  accounts: Account[]
  hidden: boolean
}) {
  return (
    <div className="divide-y divide-ink-soft/10">
      {accounts.map((account) => (
        <AccountRow key={account.id} account={account} hidden={hidden} />
      ))}
    </div>
  )
}

function AccountRow({ account, hidden }: { account: Account; hidden: boolean }) {
  const [open, setOpen] = useState(false)
  const Icon = ICONS[account.icon]
  const accent = ACCENT[account.icon]

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition hover:bg-white/40"
      >
        <span
          className={`grid size-9 shrink-0 place-items-center rounded-xl ${accent.wrap} ${accent.icon}`}
        >
          <Icon className="size-[18px]" strokeWidth={2} />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold text-ink">{account.name}</p>
        </div>

        <div className="flex flex-col items-end gap-0.5">
          <Money
            amount={account.balance}
            hidden={hidden}
            maskWidth={4}
            className="text-[15px]"
          />
          {account.badge ? (
            <span className="rounded-full bg-tone-positive/12 px-2 py-0.5 text-[11px] font-medium text-tone-positive">
              {account.badge}
            </span>
          ) : null}
        </div>

        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-ink-soft/8">
          <ChevronDown
            className={`size-4 text-ink-soft transition-transform duration-300 ${
              open ? 'rotate-180' : ''
            }`}
            strokeWidth={2.2}
          />
        </span>
      </button>

      {open ? (
        <ul className="animate-fade-in space-y-1 px-5 pb-3 pl-[4.25rem]">
          {account.children.map((child) => (
            <li
              key={child.name}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-ink">{child.name}</p>
                <p className="truncate text-xs text-ink-soft">{child.detail}</p>
              </div>
              <Money
                amount={child.balance}
                hidden={hidden}
                maskWidth={4}
                className="text-sm font-medium text-ink-soft"
              />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
