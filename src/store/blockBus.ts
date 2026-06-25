import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { ThreadId } from '../types'

/**
 * The block bus: a tiny, generic coordination layer for custom blocks.
 *
 * Blocks in an assistant reply render independently and can't reach each other
 * directly — yet some need to (a "Reassess" suggestion pill in one message
 * re-opening a wizard authored in an earlier one). The bus gives every block a
 * stable string `id` (authored by the model in the block JSON) and three
 * primitives keyed by that id:
 *
 *   - `register` / `unregister` — a block publishes itself so others can resolve
 *     it by id alone (e.g. the wizard card publishes its flow + thread).
 *   - `patch` + `state[id]`     — a reactive, *persisted* slice of shared state
 *     (e.g. a wizard's answers / progress), so closing and reopening resumes.
 *   - `signal`                  — a fire-and-forget intent aimed at an id
 *     (e.g. `signal('idleCash', 'open')`), consumed by `BlockOverlayHost`.
 *
 * The wiring lives in the reply text as ids the model emits, so new
 * "block reacts to block" cases need no bespoke plumbing — just another id.
 */

/** A single question in a wizard flow. One option is chosen (single-select). */
export interface WizardQuestion {
  /** Prompt shown to the user, e.g. "What's your aim?". */
  title: string
  options: {
    /** Stable value stored in answers. */
    value: string
    /** Human label shown on the option and echoed into the Q/A message. */
    label: string
    /** Next question id; omitted means this option ends the flow. */
    next?: string
  }[]
}

/** A branching questionnaire, embedded in a `bank:wizard` block. */
export interface WizardFlow {
  title?: string
  subtitle?: string
  /** Id of the first question. */
  start: string
  questions: Record<string, WizardQuestion>
}

/** What a wizard block publishes to the bus so its drawer can be opened by id. */
export interface WizardEntry {
  type: 'wizard'
  /** Thread the wizard was authored in — where the submitted answers are sent. */
  threadId: ThreadId
  flow: WizardFlow
}

/** A registered, addressable block. New overlay-bearing block types union in here. */
export type BlockEntry = WizardEntry

/** Reactive, persisted per-id state. Widens to a union as new block types land. */
export interface WizardSession {
  /** questionId → chosen option value. */
  answers: Record<string, string>
  /** Visited question ids, in order (path[0] is the flow's start). */
  path: string[]
  /** True once the answers have been submitted. */
  done: boolean
}
export type BlockState = WizardSession

/** A fire-and-forget intent. `n` increments so repeat signals always retrigger. */
interface Signal {
  name: string
  payload?: unknown
  n: number
}

interface BlockBusState {
  /** Live blocks, keyed by id. Transient — rebuilt as blocks mount. */
  registry: Record<string, BlockEntry>
  /** Shared per-id state. Persisted to sessionStorage. */
  state: Record<string, BlockState>
  /** Pending intents, keyed by target id. Transient. */
  signals: Record<string, Signal>

  register: (id: string, entry: BlockEntry) => void
  unregister: (id: string) => void
  /** Shallow-merge a partial into an id's shared state. */
  patch: (id: string, partial: Partial<BlockState>) => void
  /** Aim an intent at an id (consumed by BlockOverlayHost). */
  signal: (id: string, name: string, payload?: unknown) => void
  /** Drop state + signals for every block registered to a thread. Called when
   *  that conversation is cleared so a new chat starts blocks from scratch. */
  resetThread: (threadId: ThreadId) => void
}

export const useBlockBus = create<BlockBusState>()(
  persist(
    (set) => ({
      registry: {},
      state: {},
      signals: {},

      register: (id, entry) =>
        set((s) => ({ registry: { ...s.registry, [id]: entry } })),

      unregister: (id) =>
        set((s) => {
          if (!(id in s.registry)) return s
          const registry = { ...s.registry }
          delete registry[id]
          return { registry }
        }),

      patch: (id, partial) =>
        set((s) => ({
          state: {
            ...s.state,
            [id]: { ...s.state[id], ...partial } as BlockState,
          },
        })),

      signal: (id, name, payload) =>
        set((s) => ({
          signals: {
            ...s.signals,
            [id]: { name, payload, n: (s.signals[id]?.n ?? 0) + 1 },
          },
        })),

      resetThread: (threadId) =>
        set((s) => {
          const ids = Object.keys(s.registry).filter(
            (id) => s.registry[id].threadId === threadId,
          )
          if (ids.length === 0) return s
          const state = { ...s.state }
          const signals = { ...s.signals }
          for (const id of ids) {
            delete state[id]
            delete signals[id]
          }
          return { state, signals }
        }),
    }),
    {
      name: 'bank-ai-blocks',
      storage: createJSONStorage(() => sessionStorage),
      // Only the shared state survives reload. `registry` is rebuilt as blocks
      // re-mount; `signals` are ephemeral intents that must not replay.
      partialize: (s) => ({ state: s.state }),
    },
  ),
)
