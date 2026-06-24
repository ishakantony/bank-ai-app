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
 * Follow-up suggestion pills shown beneath a finished assistant reply. Each item
 * is a discriminated union on `kind`: a `prompt` sends text back into the thread,
 * a `link` opens a URL. New affordances (e.g. an in-app `action`) slot in as
 * another union member without touching the renderer's existing branches.
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
export const suggestionsSchema = z.object({
  items: z
    .array(z.discriminatedUnion('kind', [promptPill, linkPill]))
    .min(1)
    .max(4),
})
export type SuggestionsData = z.infer<typeof suggestionsSchema>
export type SuggestionItem = SuggestionsData['items'][number]
