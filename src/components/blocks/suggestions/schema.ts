import { z } from 'zod'

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
