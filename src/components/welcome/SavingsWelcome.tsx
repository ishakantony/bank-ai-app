import { PiggyBank, Target, Repeat, TrendingUp } from 'lucide-react'
import type { WelcomeProps } from './types'
import { QuickAction } from './QuickAction'

/** Savings & Goals — a goal-progress card up top, suggestions below. */
export function SavingsWelcome({ onSend }: WelcomeProps) {
  const progress = 64

  return (
    <div className="animate-float-in flex flex-col gap-6 py-8">
      <div className="flex items-center gap-3">
        <span className="grid size-12 place-items-center rounded-xl bg-gradient-to-br from-accent-3/30 to-accent-1/30 text-white ring-1 ring-white/15">
          <PiggyBank className="size-6" strokeWidth={1.75} />
        </span>
        <div>
          <h2 className="text-xl font-semibold text-white">Grow your savings</h2>
          <p className="text-sm text-white/55">Track goals and build the habit.</p>
        </div>
      </div>

      {/* Goal progress card */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-medium text-white">Holiday fund</span>
          <span className="text-sm text-white/60">RM1,920 / RM3,000</span>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent-1 via-accent-2 to-accent-3"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-white/45">{progress}% there — keep it up!</p>
      </div>

      <div className="flex flex-wrap gap-2.5">
        <QuickAction
          label="Open a new goal"
          icon={Target}
          onClick={() => onSend('I want to open a new savings goal.')}
        />
        <QuickAction
          label="Set up auto-save"
          icon={Repeat}
          onClick={() => onSend('Help me set up a recurring auto-save transfer.')}
        />
        <QuickAction
          label="Project my growth"
          icon={TrendingUp}
          onClick={() => onSend('How long until I reach my savings goal?')}
        />
      </div>
    </div>
  )
}
