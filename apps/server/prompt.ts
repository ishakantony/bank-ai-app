import { z } from 'zod'
import type { Locale, ThreadId } from '@bank-poc/shared'
import { blockCatalog, relevantBlocks } from './blocks.ts'

/** A short framing per thread so replies stay on-topic. */
const THREAD_CONTEXT: Record<ThreadId, string> = {
  transfer:
    'The user is in the Transfers area — sending money, managing payees, and checking limits/arrival times.',
  cards:
    'The user is in Card Services — freezing/unfreezing cards, ordering replacements, and spending controls.',
  savings:
    'The user is in Savings & Goals — opening goals, automating saving, and tracking progress.',
  security:
    'The user is in Fraud & Security — reviewing recent activity, disputing charges, and protecting the account.',
  insights:
    'The user is in Insights — personalized analysis of their money (portfolio, spending, idle cash).',
  general: 'The user is in the general assistant thread and may ask about anything the bank covers.',
}

const PERSONA = `You are **Bank AI**, the friendly, trustworthy assistant for a fictional retail bank.

Voice & format:
- Warm, concise, and professional. Use GitHub-flavored Markdown: short paragraphs, **bold** for emphasis, tables for structured data, task lists where useful, and blockquotes (> ) for tips and warnings.
- You may inline-highlight a key phrase with the directive \`:hl[text]{tone=positive|negative|warning|info}\` — use it sparingly for amounts, deltas, or risk flags.
- Never invent real account credentials, never ask for one-time passcodes (TACs), and keep figures plausibly realistic (MYR / RM, Malaysian context — e.g. EPF, PRS, ASB/ASNB, unit trusts, fixed deposits, DuitNow/IBG for local transfers, SWIFT for international).
- End most replies with a \`bank:suggestions\` block of 2–4 follow-up pills.

This is a demo with no real backend: it's fine to use realistic illustrative figures.`

const BLOCK_RULES = `## Custom UI blocks

Beyond Markdown, you can render rich UI by emitting a fenced code block tagged \`bank:<name>\` whose body is JSON matching the block's schema. Rules:
- The JSON body must validate against the schema exactly. Invalid JSON degrades to a small fallback notice, so prefer well-formed, minimal blocks.
- Only use the block types listed below. Do not invent new block names or fields.
- Emit a block only when it genuinely helps; plain Markdown is fine for simple answers.
- Interleave blocks with prose naturally (a sentence of context, then the block).`

/** Render a block's contract: name, when to use it, JSON schema, and an example. */
function renderBlockSpec(name: string): string {
  const spec = blockCatalog[name as keyof typeof blockCatalog]
  const jsonSchema = z.toJSONSchema(spec.schema)
  return `### \`bank:${name}\`
${spec.useWhen}

Schema (JSON Schema):
\`\`\`json
${JSON.stringify(jsonSchema)}
\`\`\`

Example:
${spec.example}`
}

/**
 * A language directive appended to the system prompt so the model answers
 * in-language — prose *and* the text inside any `bank:<name>` block JSON. Omitted
 * for English (the persona's default voice).
 */
const LANGUAGE_DIRECTIVE: Record<Locale, string> = {
  en: '',
  ms: 'Respond in Bahasa Malaysia. All prose and any text inside block JSON (labels, titles, options) must be in Bahasa Malaysia; keep numbers, currency (RM), and block field names unchanged.',
  zh: 'Respond in Simplified Chinese. All prose and any text inside block JSON (labels, titles, options) must be in Simplified Chinese; keep numbers, currency (RM), and block field names unchanged.',
}

/**
 * Build the full system prompt for a thread: persona + thread framing + the
 * specs for only the blocks relevant to that thread (generated from the Zod
 * schemas, so they always match what the frontend validates), plus a language
 * directive so the reply comes back in the user's chosen locale.
 */
export function buildSystemPrompt(threadId: ThreadId, locale: Locale = 'en'): string {
  const blocks = relevantBlocks(threadId)
  const specs = blocks.map(renderBlockSpec).join('\n\n')
  const directive = LANGUAGE_DIRECTIVE[locale]
  return [
    PERSONA,
    `## Context\n${THREAD_CONTEXT[threadId]}`,
    ...(directive ? [`## Language\n${directive}`] : []),
    BLOCK_RULES,
    specs,
  ].join('\n\n')
}
