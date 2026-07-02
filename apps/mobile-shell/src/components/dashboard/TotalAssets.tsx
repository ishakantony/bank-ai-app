import { Info, Eye, EyeOff } from 'lucide-react'
import { Money } from '../Money'

interface TotalAssetsProps {
  amount: number
  hidden: boolean
  onToggle: () => void
}

export function TotalAssets({ amount, hidden, onToggle }: TotalAssetsProps) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <div className="flex items-center gap-1.5 text-sm font-medium text-ink-soft">
        Total Assets
        <Info className="size-3.5 text-ink-soft/70" strokeWidth={2} />
      </div>
      <div className="flex items-center gap-2.5">
        <Money amount={amount} hidden={hidden} className="text-xl" />
        <button
          type="button"
          onClick={onToggle}
          aria-label={hidden ? 'Show balances' : 'Hide balances'}
          className="text-ink-soft transition hover:text-brand-1"
        >
          {hidden ? (
            <EyeOff className="size-[18px]" strokeWidth={2} />
          ) : (
            <Eye className="size-[18px]" strokeWidth={2} />
          )}
        </button>
      </div>
    </div>
  )
}
