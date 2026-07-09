import type { ReactNode } from 'react'
import { Sparkles } from 'lucide-react'
import type { BaseCardData, InsightCardData } from './schema'

// The Bank AI chat app the card deep-links into. Same default the shell's
// "Your Banking Summary" row uses; overridable per remote deployment.
const AI_SHELL_URL = import.meta.env.VITE_AI_SHELL_URL ?? 'http://localhost:9999'

/**
 * Deep-link into the chat app and start a conversation. Mirrors the shell's
 * BankingSummaryCard: `?topic=` opens a specific thread (e.g. an insight),
 * `?message=` seeds the first message; with neither it's a plain regular chat.
 * The remote runs inside the shell page, so `window.open` opens the AI shell.
 */
export function openChat(chrome: Pick<BaseCardData, 'topic' | 'prompt'>) {
  const url = new URL('/chat', AI_SHELL_URL)
  if (chrome.topic) url.searchParams.set('topic', chrome.topic)
  if (chrome.prompt) url.searchParams.set('message', chrome.prompt)
  window.open(url.toString(), '_blank', 'noopener,noreferrer')
}

/**
 * Bright palette that pops on the deep-blue gradient card (matches the shell's
 * insight aesthetic). Cycled across chart segments (bars, donut slices).
 */
export const PALETTE = ['#5fe3ff', '#b79bff', '#74e6a6', '#ffd36b', '#ff9bb0']

/**
 * Mint fill for "positive"/progress visuals (gauge arc, progress bar, knob).
 * The literal lives in `index.css` as `--color-glow-green`; used here via the
 * CSS var so SVG strokes and inline styles share one source of truth.
 */
export const MINT = 'var(--color-glow-green)'

const MYR_WHOLE = new Intl.NumberFormat('en-MY', { maximumFractionDigits: 0 })

/** Format a whole-number amount with a currency prefix, e.g. `RM6,800`. */
export function money(currency: string | undefined, n: number) {
  return `${currency ?? 'RM'}${MYR_WHOLE.format(n)}`
}

/** Badge tint per tone, drawn on the deep card. */
const TONE: Record<NonNullable<BaseCardData['deltaTone']>, string> = {
  positive: 'bg-tone-positive/25 text-tone-positive-fg',
  negative: 'bg-tone-negative/25 text-tone-negative-fg',
  warning: 'bg-tone-warning/25 text-tone-warning-fg',
  info: 'bg-tone-info/25 text-tone-info-fg',
}

/** Eyebrow: sparkle + "AI · <period>", scaled for the card size. */
function Eyebrow({ period, small }: { period: string; small?: boolean }) {
  return (
    <p
      className={`flex items-center gap-1 font-semibold uppercase tracking-wide text-white/70 ${
        small ? 'text-[9px]' : 'text-[11px]'
      }`}
    >
      <Sparkles
        className={`${small ? 'size-2.5' : 'size-3.5'} text-brand-3`}
        strokeWidth={2.2}
      />
      AI · {period}
    </p>
  )
}

/** The delta pill, e.g. "+45% vs 6-mo avg". */
function Delta({
  chrome,
  small,
}: {
  chrome: Pick<BaseCardData, 'delta' | 'deltaTone'>
  small?: boolean
}) {
  if (!chrome.delta) return null
  return (
    <span
      className={`shrink-0 rounded-full font-semibold ${TONE[chrome.deltaTone ?? 'warning']} ${
        small ? 'px-2 py-0.5 text-[9px]' : 'px-2.5 py-1 text-[11px]'
      }`}
    >
      {chrome.delta}
    </span>
  )
}

/** Shared gradient surface. `radius` differs between the full slide and tiles. */
function Frame({
  radius,
  padding,
  children,
}: {
  radius: string
  padding: string
  children: ReactNode
}) {
  return (
    <div
      className={`relative flex h-full w-full flex-col overflow-hidden bg-gradient-to-bl from-brand-2 via-brand-1 to-brand-deep text-white ${radius} ${padding}`}
    >
      <div className="pointer-events-none absolute -right-8 -top-10 size-32 rounded-full bg-white/15 blur-2xl" />
      {children}
    </div>
  )
}

/**
 * The only interactive element on the card — deep-links into Bank AI. `hero`
 * renders a labelled pill ("Full Insight" + AI icon); the compact tile variants
 * render an icon-only circular button (the AI icon alone). Both sit bottom-right.
 */
function CtaButton({
  chrome,
  icon,
}: {
  chrome: Pick<BaseCardData, 'cta' | 'topic' | 'prompt'>
  icon?: boolean
}) {
  if (icon) {
    return (
      <button
        type="button"
        aria-label={chrome.cta ?? 'Open in Bank AI'}
        onClick={() => openChat(chrome)}
        className="grid size-8 shrink-0 place-items-center rounded-full bg-ink/85 text-white backdrop-blur-md transition hover:bg-ink active:scale-[0.95]"
      >
        <Sparkles className="size-4 text-brand-3" strokeWidth={2.2} />
      </button>
    )
  }
  return (
    <button
      type="button"
      onClick={() => openChat(chrome)}
      className="inline-flex items-center gap-1.5 rounded-full bg-ink/85 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-ink active:scale-[0.98]"
    >
      {chrome.cta ?? 'Full Insight'}
      <Sparkles className="size-4 text-brand-3" strokeWidth={2.2} />
    </button>
  )
}

/** The layout size — mirrors `InsightCardData['variant']` without the optional. */
export type Variant = NonNullable<InsightCardData['variant']>

/**
 * The one place the four card layouts (hero / wide / tall / compact) are
 * arranged. Every preset supplies only its `stat` (optional prominent figure)
 * and its `visual` (the body slot) and gets the full deep-blue chrome — eyebrow,
 * delta badge, clamped headline (hidden on `compact`), and the deep-link CTA
 * (a pill on `hero`, an icon button on the smaller tiles) — for free. The visual
 * slot is always a flex-height region so a preset can render a chart at
 * `h-full` regardless of variant.
 */
export function CardScaffold({
  variant = 'hero',
  chrome,
  stat,
  visual,
}: {
  variant?: Variant
  chrome: BaseCardData
  stat?: ReactNode
  visual: ReactNode
}) {
  if (variant === 'wide') {
    return (
      <Frame radius="rounded-2xl" padding="p-3.5">
        <div className="relative flex h-full items-stretch gap-3">
          <div className="flex min-w-0 flex-1 flex-col">
            <Eyebrow period={chrome.period} small />
            {stat != null && (
              <p className="num mt-0.5 text-xl font-semibold leading-tight">{stat}</p>
            )}
            <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-white/80">
              {chrome.headline}
            </p>
            <div className="mt-auto pt-1">
              <Delta chrome={chrome} small />
            </div>
          </div>
          <div className="flex w-[42%] shrink-0 flex-col">
            <div className="min-h-0 flex-1">{visual}</div>
            <div className="mt-1 flex justify-end">
              <CtaButton chrome={chrome} icon />
            </div>
          </div>
        </div>
      </Frame>
    )
  }

  if (variant === 'compact') {
    return (
      <Frame radius="rounded-2xl" padding="p-3.5">
        <div className="relative flex items-start justify-between gap-2">
          <Eyebrow period={chrome.period} small />
          <Delta chrome={chrome} small />
        </div>
        {stat != null && (
          <p className="num relative mt-1 text-xl font-semibold leading-tight">{stat}</p>
        )}
        <div className="relative mt-2 flex min-h-0 flex-1 items-end gap-2">
          <div className="min-h-0 flex-1 self-stretch">{visual}</div>
          <CtaButton chrome={chrome} icon />
        </div>
      </Frame>
    )
  }

  if (variant === 'tall') {
    return (
      <Frame radius="rounded-2xl" padding="p-3.5">
        <div className="relative flex items-start justify-between gap-2">
          <Eyebrow period={chrome.period} small />
          <Delta chrome={chrome} small />
        </div>
        {stat != null && (
          <p className="num relative mt-1 text-xl font-semibold leading-tight">{stat}</p>
        )}
        <p className="relative mt-1 line-clamp-3 text-[11px] leading-snug text-white/80">
          {chrome.headline}
        </p>
        <div className="relative mt-2 min-h-0 flex-1">{visual}</div>
        <div className="relative mt-1 flex justify-end">
          <CtaButton chrome={chrome} icon />
        </div>
      </Frame>
    )
  }

  // hero — the carousel's full-bleed slide.
  return (
    <Frame radius="rounded-3xl" padding="p-5">
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <Eyebrow period={chrome.period} />
          {stat != null && (
            <p className="num mt-1.5 text-2xl font-semibold">{stat}</p>
          )}
        </div>
        <Delta chrome={chrome} />
      </div>
      <p className="relative mt-1.5 text-[12.5px] leading-snug text-white/85">
        {chrome.headline}
      </p>
      <div className="relative mt-2 min-h-0 flex-1">{visual}</div>
      <div className="relative mt-2 flex justify-end">
        <CtaButton chrome={chrome} />
      </div>
    </Frame>
  )
}

/**
 * The default fallback card, rendered when the `preset` can't be resolved or its
 * `data` fails validation. Best-effort chrome only — no visual, never throws:
 * it reads whatever headline/period/CTA fields it can find off the raw payload
 * and shows a plain deep-blue card so the slot degrades gracefully instead of
 * crashing or going blank.
 */
export function FallbackCard({
  variant = 'hero',
  data,
}: {
  variant?: Variant
  data: unknown
}) {
  const raw = (data ?? {}) as Record<string, unknown>
  const str = (v: unknown) => (typeof v === 'string' ? v : undefined)
  const chrome: BaseCardData = {
    headline: str(raw.headline) ?? 'Your latest AI insight is ready.',
    period: str(raw.period) ?? 'Bank AI',
    delta: str(raw.delta),
    deltaTone: undefined,
    cta: str(raw.cta),
    topic: str(raw.topic),
    prompt: str(raw.prompt),
  }
  return (
    <CardScaffold
      variant={variant}
      chrome={chrome}
      visual={
        <div className="grid h-full w-full place-items-center text-center text-[11px] text-white/45">
          Open in Bank AI for the full breakdown.
        </div>
      }
    />
  )
}
