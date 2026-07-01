import { useEffect } from 'react'
import { ArrowRight, Check } from 'lucide-react'
import { useBlockBus } from '../../../store/blockBus'
import { useChatThread } from '../ChatThreadContext'
import type { WizardData } from '@bank-ai/shared'

/**
 * The in-message face of a questionnaire wizard. It publishes its flow to the
 * block bus (so a later "Reassess" pill can reopen it by id), teases the first
 * question behind a blurred fade, and opens the drawer via a bus signal. Button
 * reflects session state: Get started → Continue (partial) → Completed (done).
 */
export default function WizardCard({ data }: { data: WizardData }) {
  const threadId = useChatThread()
  const register = useBlockBus((s) => s.register)
  const signal = useBlockBus((s) => s.signal)
  const session = useBlockBus((s) => s.state[data.id])

  // Republish on mount so the id resolves even after a reload (registry is
  // transient). Bound to the thread the wizard lives in — answers are sent there.
  useEffect(() => {
    if (!threadId) return
    register(data.id, {
      type: 'wizard',
      threadId,
      flow: {
        title: data.title,
        subtitle: data.subtitle,
        start: data.start,
        questions: data.questions,
      },
    })
  }, [register, threadId, data])

  const startQuestion = data.questions[data.start]
  // Empty sessions (e.g. just after a fresh "Reassess" reset) read as "new" so
  // the button says "Get started" rather than "Continue".
  const answered = session ? Object.keys(session.answers).length > 0 : false
  const status = session?.done ? 'done' : answered ? 'partial' : 'new'

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      {data.title ? (
        <h4 className="text-sm font-semibold text-white/90">{data.title}</h4>
      ) : null}
      {data.subtitle ? (
        <p className="mt-0.5 text-[13px] text-white/55">{data.subtitle}</p>
      ) : null}

      {status === 'done' ? (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white/70">
          <Check className="size-4 shrink-0 text-tone-positive" />
          Completed — thanks for sharing.
        </div>
      ) : (
        <div className="relative mt-3">
          <p className="mb-2 text-[13px] font-medium text-white/80">
            {startQuestion?.title}
          </p>

          {/* Real options, teased: each lower one blurs + fades, and the button
              sits over the bottom of the stack so a few words stay legible. */}
          <div
            aria-hidden
            className="pointer-events-none space-y-1.5 [mask-image:linear-gradient(to_bottom,black_25%,transparent_92%)]"
          >
            {startQuestion?.options.slice(0, 4).map((opt, i) => (
              <div
                key={opt.value}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[13px] text-white/70"
                style={{ filter: `blur(${i * 1.2}px)`, opacity: 1 - i * 0.16 }}
              >
                {opt.label}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => signal(data.id, 'open')}
            className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-br from-accent-1 to-accent-2 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.01] active:scale-100"
          >
            {status === 'partial' ? 'Continue' : 'Get started'}
            <ArrowRight className="size-4" />
          </button>
        </div>
      )}
    </div>
  )
}
