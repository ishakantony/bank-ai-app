import { Sparkles } from 'lucide-react'
import type { WelcomeProps } from './types'
import { QuickAction } from './QuickAction'

/** Fallback welcome screen for any topic without a bespoke layout. */
export function GenericWelcome({ topic, onSend }: WelcomeProps) {
  return (
    <div className="animate-float-in flex flex-col items-center gap-6 py-8 text-center">
      <span className="grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-accent-1/30 to-accent-3/30 text-white ring-1 ring-white/15">
        <Sparkles className="size-7" strokeWidth={1.75} />
      </span>
      <div>
        <h2 className="text-2xl font-semibold text-white">{topic.name}</h2>
        <p className="mt-1.5 text-sm text-white/55">{topic.description}</p>
      </div>
      <QuickAction
        label={`Get started with ${topic.name}`}
        onClick={() => onSend(`Help me with ${topic.name}.`)}
      />
    </div>
  )
}
