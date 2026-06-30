import { z } from 'zod'
import type { ThreadId } from '../src/types.ts'
import { actionCardSchema } from '../src/components/blocks/actionCard/schema.ts'
import { allocationDonutSchema } from '../src/components/blocks/allocationDonut/schema.ts'
import { driftBarsSchema } from '../src/components/blocks/driftBars/schema.ts'
import { suggestionsSchema } from '../src/components/blocks/suggestions/schema.ts'
import { wizardSchema } from '../src/components/blocks/wizard/schema.ts'

/**
 * Server-side catalog of the custom blocks the assistant may emit. The Zod
 * schemas are imported from the frontend (the single source of truth for each
 * block's contract); here we attach the model-facing teaching material — a
 * one-line "use when", and one compact example of the exact ```bank:<name>```
 * fence. The JSON schema shown to the model is generated from the Zod schema
 * via `z.toJSONSchema`, so the spec can never drift from what the frontend
 * actually validates.
 */

export interface BlockSpec {
  schema: z.ZodType
  /** One-line description of when the model should reach for this block. */
  useWhen: string
  /** A minimal, valid example of the fenced block (body is the JSON). */
  example: string
}

export const blockCatalog = {
  allocationDonut: {
    schema: allocationDonutSchema,
    useWhen: 'Show a breakdown/allocation as a donut (e.g. portfolio mix).',
    example: `\`\`\`bank:allocationDonut
{ "title": "Current allocation", "slices": [
  { "label": "Equities", "value": 68 },
  { "label": "Bonds", "value": 24 },
  { "label": "Cash", "value": 8 }
] }
\`\`\``,
  },
  driftBars: {
    schema: driftBarsSchema,
    useWhen: 'Compare a target vs current value across a few items.',
    example: `\`\`\`bank:driftBars
{ "title": "Target vs current", "unit": "%", "items": [
  { "label": "Equities", "target": 60, "current": 68 },
  { "label": "Bonds", "target": 30, "current": 24 }
] }
\`\`\``,
  },
  actionCard: {
    schema: actionCardSchema,
    useWhen: 'Propose a short list of suggested actions with an optional CTA.',
    example: `\`\`\`bank:actionCard
{ "title": "Suggested trades", "actions": [
  { "label": "Trim equities", "detail": "Sell ~RM4,200 to lock in gains" },
  { "label": "Top up bonds", "detail": "Restore your income buffer" }
], "cta": { "label": "Prepare these trades for review" } }
\`\`\``,
  },
  wizard: {
    schema: wizardSchema,
    useWhen:
      'Ask the user a short branching questionnaire before advising. The user later submits answers as a "Q: …/A: …" message; reply by tailoring advice to their answers.',
    example: `\`\`\`bank:wizard
{ "id": "idleCash", "title": "Make your idle cash work", "start": "aim",
  "questions": {
    "aim": { "title": "What's your aim for this money?", "options": [
      { "value": "wealth", "label": "Grow my wealth", "next": "risk" },
      { "value": "buffer", "label": "Keep a rainy-day buffer" }
    ] },
    "risk": { "title": "How do you feel about ups and downs?", "options": [
      { "value": "steady", "label": "Keep it steady" },
      { "value": "bold", "label": "Chase higher returns" }
    ] }
  } }
\`\`\``,
  },
  suggestions: {
    schema: suggestionsSchema,
    useWhen:
      'End most replies with 2–4 follow-up pills. `prompt` sends text back, `link` opens a URL. Always place this last.',
    example: `\`\`\`bank:suggestions
{ "items": [
  { "kind": "prompt", "label": "Send money", "send": "I'd like to send some money" },
  { "kind": "prompt", "label": "Freeze a card" },
  { "kind": "link", "label": "Open the banking app", "url": "https://example.com/app" }
] }
\`\`\``,
  },
} satisfies Record<string, BlockSpec>

export type BlockName = keyof typeof blockCatalog

/** Blocks offered on every thread (follow-up pills are universally useful). */
const ALWAYS: BlockName[] = ['suggestions']

/**
 * Which blocks are relevant per thread. Only these schemas are injected into
 * the system prompt for a given conversation, keeping the prompt small as the
 * catalog grows. This static map is the concrete form of the relevance filter;
 * it can graduate to per-block tags later without touching the renderer.
 */
const RELEVANT: Partial<Record<ThreadId, BlockName[]>> = {
  insights: ['allocationDonut', 'driftBars', 'actionCard', 'wizard'],
}

export function relevantBlocks(threadId: ThreadId): BlockName[] {
  const specific = RELEVANT[threadId] ?? []
  // De-dupe while preserving order (specific blocks first, then the always-on).
  return [...new Set([...specific, ...ALWAYS])]
}
