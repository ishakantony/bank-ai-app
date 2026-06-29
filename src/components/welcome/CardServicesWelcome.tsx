import { Snowflake, RefreshCw, Settings2, Wifi } from 'lucide-react'
import type { WelcomeProps } from './types'
import { QuickAction } from './QuickAction'

/** Card Services — leads with a faux card visual, then a stacked action list. */
export function CardServicesWelcome({ onSend }: WelcomeProps) {
  return (
    <div className="animate-float-in flex flex-col gap-6 py-8">
      {/* Faux payment card */}
      <div className="relative aspect-[1.6/1] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-accent-1 via-accent-2 to-accent-3 p-5 shadow-[0_20px_60px_-20px_rgba(150,120,255,0.7)] ring-1 ring-white/20">
        <div className="absolute -right-8 -top-8 size-32 rounded-full bg-white/15 blur-2xl" />
        <div className="flex h-full flex-col justify-between text-white">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium tracking-wide">Bank AI</span>
            <Wifi className="size-5 rotate-90 opacity-80" />
          </div>
          <div>
            <p className="font-mono text-lg tracking-[0.2em]">···· ···· ···· 4471</p>
            <p className="mt-1 text-xs uppercase tracking-wider text-white/75">
              Nurul Aisyah · 09/28
            </p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-white">Manage your cards</h2>
        <p className="mt-1 text-sm text-white/55">
          Freeze, replace, or fine-tune the controls on your card.
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        <QuickAction
          label="Freeze my card"
          icon={Snowflake}
          onClick={() => onSend('Please freeze my card.')}
        />
        <QuickAction
          label="Order a replacement"
          icon={RefreshCw}
          onClick={() => onSend('I need to order a replacement card.')}
        />
        <QuickAction
          label="Adjust card controls"
          icon={Settings2}
          onClick={() => onSend('I want to adjust my card spending controls.')}
        />
      </div>
    </div>
  )
}
