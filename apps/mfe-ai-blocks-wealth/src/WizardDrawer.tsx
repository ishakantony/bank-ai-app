import { useEffect, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Check, ChevronLeft, ChevronRight, X } from 'lucide-react'
import {
  useBlockBus,
  sendChatMessage,
  type OverlayProps,
  type WizardEntry,
  type WizardFlow,
} from '@bank-poc/blocks-runtime'

function isFresh(payload: unknown): boolean {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    (payload as { fresh?: unknown }).fresh === true
  )
}

/** Build the `Q: …\nA: …` message from the answered path, in order. */
function buildMessage(
  flow: WizardFlow,
  path: string[],
  answers: Record<string, string>,
): string {
  return path
    .filter((qid) => answers[qid] != null)
    .map((qid) => {
      const q = flow.questions[qid]
      const opt = q?.options.find((o) => o.value === answers[qid])
      return `Q: ${q?.title ?? qid}\nA: ${opt?.label ?? answers[qid]}`
    })
    .join('\n\n')
}

/**
 * The floating bottom-sheet that walks the user through a wizard flow. Built on
 * Radix Dialog (focus trap, Escape/outside-click) and styled to the app's dark
 * glassmorphism with the rotating conic-gradient border from the chat input.
 *
 * Loaded on demand by the host's `BlockOverlayHost` via the entry's
 * `loadOverlay` — so it ships from this remote, not the host. It reads/writes
 * the shared block bus and posts answers through the runtime's chat bridge
 * (`sendChatMessage`), never importing the host's chat store.
 *
 * Navigation tracks a path stack: the footer reads the *chosen* option —
 * `Next →` when it branches onward, `Submit` when it's terminal. Going back and
 * changing an earlier answer truncates everything downstream (the branch
 * changed). Closing keeps partial answers, so the card offers "Continue".
 */
export default function WizardDrawer({ id, entry, payload, onClose }: OverlayProps) {
  const flow = (entry as WizardEntry).flow
  const threadId = (entry as WizardEntry).threadId
  const session = useBlockBus((s) => s.state[id])
  const patch = useBlockBus((s) => s.patch)

  // Resume at the frontier unless this is a fresh (Reassess) open. Read from the
  // store synchronously so we don't flash question 1 before the effect runs.
  const [cursor, setCursor] = useState(() => {
    if (isFresh(payload)) return 0
    const s = useBlockBus.getState().state[id]
    return s && !s.done ? Math.max(0, s.path.length - 1) : 0
  })

  // Reset the session when starting fresh or when there's nothing to resume.
  useEffect(() => {
    const s = useBlockBus.getState().state[id]
    if (isFresh(payload) || !s || s.done) {
      patch(id, { answers: {}, path: [flow.start], done: false })
    }
    // Run once per mount — the host remounts us on each open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const path = session?.path ?? [flow.start]
  const answers = session?.answers ?? {}
  const currentQid = path[cursor] ?? flow.start
  const question = flow.questions[currentQid]
  const selectedValue = answers[currentQid]
  const selectedOption = question?.options.find((o) => o.value === selectedValue)
  const isTerminal = !!selectedOption && !selectedOption.next

  function select(value: string) {
    const nextAnswers = { ...answers }
    let nextPath = path
    // Changing an earlier answer can switch branches — drop everything after it.
    if (nextAnswers[currentQid] !== value) {
      const idx = path.indexOf(currentQid)
      nextPath = path.slice(0, idx + 1)
      for (const dropped of path.slice(idx + 1)) delete nextAnswers[dropped]
    }
    nextAnswers[currentQid] = value
    patch(id, { answers: nextAnswers, path: nextPath })
  }

  function goNext() {
    if (!selectedOption?.next) return
    if (path[cursor + 1] !== selectedOption.next) {
      patch(id, { path: [...path.slice(0, cursor + 1), selectedOption.next] })
    }
    setCursor(cursor + 1)
  }

  function submit() {
    patch(id, { done: true })
    sendChatMessage(threadId, buildMessage(flow, path, answers))
    onClose()
  }

  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="animate-fade-in fixed inset-0 z-40 bg-black/55 backdrop-blur-sm" />
        <Dialog.Content
          aria-describedby={undefined}
          className="animate-drawer-in fixed inset-x-3 bottom-3 z-50 outline-none"
        >
          {/* Rotating gradient border ring (mirrors ChatInput), floating so the
              full animated edge is visible around the sheet. */}
          <div
            className="rounded-3xl p-[1.5px] shadow-2xl"
            style={{
              background:
                'conic-gradient(from var(--angle), var(--color-accent-1), var(--color-accent-2), var(--color-accent-3), var(--color-accent-1))',
              animation: 'spin-angle 6s linear infinite',
            }}
          >
            <div className="rounded-[calc(1.5rem-1.5px)] bg-ink-deep/95 p-5 backdrop-blur-xl">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Dialog.Title className="text-base font-semibold text-white">
                    {flow.title ?? 'A few quick questions'}
                  </Dialog.Title>
                  <p className="mt-0.5 text-[12px] font-medium uppercase tracking-wide text-white/40">
                    Question {cursor + 1}
                  </p>
                </div>
                <Dialog.Close
                  aria-label="Close"
                  className="-mr-1 -mt-1 grid size-8 shrink-0 place-items-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white"
                >
                  <X className="size-4" />
                </Dialog.Close>
              </div>

              {question ? (
                <>
                  <p className="text-[15px] font-medium text-white/90">
                    {question.title}
                  </p>

                  <div className="no-scrollbar mt-3 max-h-[45dvh] space-y-2 overflow-y-auto">
                    {question.options.map((opt) => {
                      const active = opt.value === selectedValue
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => select(opt.value)}
                          className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3.5 py-3 text-left text-[14px] transition ${
                            active
                              ? 'border-accent-2/60 bg-accent-2/15 text-white'
                              : 'border-white/10 bg-white/5 text-white/80 hover:border-white/20 hover:bg-white/10'
                          }`}
                        >
                          <span className="min-w-0">{opt.label}</span>
                          {active ? (
                            <Check className="size-4 shrink-0 text-accent-3" />
                          ) : null}
                        </button>
                      )
                    })}
                  </div>
                </>
              ) : (
                <p className="text-sm text-white/60">This question is unavailable.</p>
              )}

              <div className="mt-5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCursor((c) => Math.max(0, c - 1))}
                  disabled={cursor === 0}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronLeft className="size-4" />
                  Previous
                </button>

                {isTerminal ? (
                  <button
                    type="button"
                    onClick={submit}
                    className="ml-auto inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-accent-1 to-accent-2 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.01] active:scale-100"
                  >
                    <Check className="size-4" />
                    Submit
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={!selectedOption}
                    className="ml-auto inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-br from-accent-1 to-accent-2 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.01] active:scale-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                    <ChevronRight className="size-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
