import { ArrowLeftRight, Send, Users, Gauge } from 'lucide-react'
import type { WelcomeProps } from './types'
import { QuickAction } from './QuickAction'

/** Transfer Money — centered "send" hero over a faux balance card. */
export function TransferWelcome({ onSend }: WelcomeProps) {
  return (
    <div className="animate-float-in flex flex-col items-center gap-6 py-8 text-center">
      <span className="grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-accent-1/30 to-accent-2/30 text-white ring-1 ring-white/15">
        <ArrowLeftRight className="size-7" strokeWidth={1.75} />
      </span>

      <div>
        <h2 className="text-2xl font-semibold text-white">Send money in seconds</h2>
        <p className="mt-1.5 text-sm text-white/55">
          Pay anyone instantly and securely — just tell me who and how much.
        </p>
      </div>

      <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-left backdrop-blur-md">
        <span className="text-xs uppercase tracking-wider text-white/40">
          Available balance
        </span>
        <p className="mt-1 text-3xl font-semibold text-white">RM4,820.65</p>
        <p className="mt-0.5 text-xs text-white/45">Everyday Checking ··· 4471</p>
      </div>

      <div className="flex flex-wrap justify-center gap-2.5">
        <QuickAction
          label="Send to a contact"
          icon={Send}
          onClick={() => onSend('I want to send money to one of my contacts.')}
        />
        <QuickAction
          label="Pay a new payee"
          icon={Users}
          onClick={() => onSend('Help me set up and pay a new payee.')}
        />
        <QuickAction
          label="Check my limits"
          icon={Gauge}
          onClick={() => onSend('What are my current transfer limits?')}
        />
      </div>
    </div>
  )
}
