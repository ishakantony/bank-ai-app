import { z } from 'zod'

/**
 * Zod schemas for every custom block, kept separate from the (lazy-loaded)
 * component implementations so importing the registry never pulls Recharts into
 * the initial bundle. Each schema is the contract the assistant's JSON must
 * satisfy; anything that fails `safeParse` falls back to the inline notice.
 */

export const allocationDonutSchema = z.object({
  /** Optional heading shown above the ring. */
  title: z.string().optional(),
  /** Each ring segment. Values are relative; they don't need to sum to 100. */
  slices: z
    .array(
      z.object({
        label: z.string(),
        value: z.number().nonnegative(),
      }),
    )
    .min(1),
})
export type AllocationDonutData = z.infer<typeof allocationDonutSchema>

export const driftBarsSchema = z.object({
  title: z.string().optional(),
  /** Unit appended to the axis/labels, e.g. "%". Defaults to "%". */
  unit: z.string().optional(),
  items: z
    .array(
      z.object({
        label: z.string(),
        target: z.number(),
        current: z.number(),
      }),
    )
    .min(1),
})
export type DriftBarsData = z.infer<typeof driftBarsSchema>

/**
 * A spending overview: two hero stats (total spend + transaction count) above a
 * dual-line cumulative chart comparing this period against the previous one.
 * Both `current` and `previous` are running totals keyed by day-of-month, so the
 * lines climb across the month; `current` typically stops at today (`markerDay`,
 * where a dashed marker sits) while `previous` runs the full month, faded.
 */
export const spendTrendSchema = z.object({
  /** Hero stat: total spend so far this period. */
  spend: z.number().nonnegative(),
  /** Hero stat: transaction count this period. */
  transactions: z.number().int().nonnegative(),
  /** Currency prefix; defaults to "RM". */
  currency: z.string().optional(),
  /** Legend/end label for the solid (current) line, e.g. "June". */
  currentLabel: z.string(),
  /** Legend/end label for the faded (previous) line, e.g. "May". */
  previousLabel: z.string(),
  /** Day-of-month for the dashed "today" marker; defaults to the last `current` day. */
  markerDay: z.number().optional(),
  /** Cumulative running total per day-of-month, current period. */
  current: z.array(z.object({ day: z.number(), amount: z.number() })).min(1),
  /** Cumulative running total per day-of-month, previous period. */
  previous: z.array(z.object({ day: z.number(), amount: z.number() })).min(1),
})
export type SpendTrendData = z.infer<typeof spendTrendSchema>

export const actionCardSchema = z.object({
  title: z.string().optional(),
  actions: z
    .array(
      z.object({
        label: z.string(),
        detail: z.string().optional(),
      }),
    )
    .min(1),
  cta: z
    .object({
      label: z.string(),
    })
    .optional(),
})
export type ActionCardData = z.infer<typeof actionCardSchema>

/**
 * A branching questionnaire rendered as a `bank:wizard` block. The card teases
 * the first question; the drawer (opened via the block bus) walks the user
 * through it. Branching lives on each option's `next` — an option with no
 * `next` ends the flow. `id` is the bus key both the card and any `signal`
 * suggestion pill (e.g. "Reassess my needs") address.
 */
const wizardQuestionSchema = z.object({
  title: z.string(),
  options: z
    .array(
      z.object({
        value: z.string(),
        label: z.string(),
        /** Next question id; omit to make this option terminal. */
        next: z.string().optional(),
      }),
    )
    .min(1),
})
export const wizardSchema = z.object({
  /** Bus id — the coordination key, addressable across messages. */
  id: z.string(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  /** Id of the first question; must exist in `questions`. */
  start: z.string(),
  questions: z.record(z.string(), wizardQuestionSchema),
})
export type WizardData = z.infer<typeof wizardSchema>

/**
 * Follow-up suggestion pills shown beneath a finished assistant reply. Each item
 * is a discriminated union on `kind`: a `prompt` sends text back into the thread,
 * a `link` opens a URL, a `signal` fires a block-bus intent at a target block
 * (e.g. re-opening a wizard). New affordances slot in as another union member
 * without touching the renderer's existing branches.
 */
const promptPill = z.object({
  kind: z.literal('prompt'),
  /** Pill text. */
  label: z.string(),
  /** Text dispatched on click; defaults to `label` when omitted. */
  send: z.string().optional(),
})
const linkPill = z.object({
  kind: z.literal('link'),
  label: z.string(),
  /** Opened in a new tab. */
  url: z.url(),
})
const signalPill = z.object({
  kind: z.literal('signal'),
  label: z.string(),
  /** Bus id of the block to signal. */
  target: z.string(),
  /** Intent name, e.g. "open". */
  name: z.string(),
  /** Optional intent payload, e.g. `{ "fresh": true }`. */
  payload: z.unknown().optional(),
})
export const suggestionsSchema = z.object({
  items: z
    .array(z.discriminatedUnion('kind', [promptPill, linkPill, signalPill]))
    .min(1)
    .max(4),
})
export type SuggestionsData = z.infer<typeof suggestionsSchema>
export type SuggestionItem = SuggestionsData['items'][number]
