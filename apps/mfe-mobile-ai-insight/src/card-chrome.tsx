import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { Sparkles } from 'lucide-react'
import type { InsightCardData } from './schema'
import { Markdown } from './Markdown'

// The Bank AI chat app the card deep-links into. Same default the shell's
// "Your Banking Summary" row uses; overridable per remote deployment.
const AI_SHELL_URL = import.meta.env.VITE_AI_SHELL_URL ?? 'http://localhost:9999'

/**
 * Deep-link into the chat app and start a conversation. `prompt` seeds the first
 * message (`?message=`); with none it opens a plain regular chat. The remote
 * runs inside the shell page, so `window.open` opens the AI shell.
 */
export function openChat(prompt?: string) {
  const url = new URL('/chat', AI_SHELL_URL)
  if (prompt) url.searchParams.set('message', prompt)
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
 * The only interactive element on the card — deep-links into Bank AI, seeded
 * with `prompt`. Label is fixed to "Full Insight". The `icon` variant renders an
 * icon-only circular button (compact tile); otherwise a labelled pill. The
 * scaffold floats it absolute bottom-right.
 */
function CtaButton({ prompt, icon }: { prompt?: string; icon?: boolean }) {
  if (icon) {
    return (
      <button
        type="button"
        aria-label="Full Insight"
        onClick={() => openChat(prompt)}
        className="grid size-8 shrink-0 place-items-center rounded-full bg-ink/85 text-white backdrop-blur-md transition hover:bg-ink active:scale-[0.95]"
      >
        <Sparkles className="size-4 text-brand-3" strokeWidth={2.2} />
      </button>
    )
  }
  return (
    <button
      type="button"
      onClick={() => openChat(prompt)}
      className="inline-flex items-center gap-1.5 rounded-full bg-ink/85 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-ink active:scale-[0.98]"
    >
      Full Insight
      <Sparkles className="size-4 text-brand-3" strokeWidth={2.2} />
    </button>
  )
}

/**
 * The card's real content: `introText` markdown (with inline highlights) inside
 * an `overflow-hidden` region. When the prose overflows its region, a bottom
 * fade mask (the `fade-bottom` utility in index.css) is applied so the last
 * visible line dissolves rather than being hard-cut. Overflow is detected with a
 * ref (`scrollHeight > clientHeight`) re-checked on mount + resize.
 */
function IntroText({ introText, className }: { introText: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [overflow, setOverflow] = useState(false)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const check = () => setOverflow(el.scrollHeight > el.clientHeight + 1)
    check()
    const ro = new ResizeObserver(check)
    ro.observe(el)
    return () => ro.disconnect()
  }, [introText])

  // Re-check after fonts settle so a late layout shift doesn't leave a stale mask.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const id = requestAnimationFrame(() =>
      setOverflow(el.scrollHeight > el.clientHeight + 1),
    )
    return () => cancelAnimationFrame(id)
  }, [introText])

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden ${overflow ? 'fade-bottom' : ''} ${className ?? ''}`}
    >
      <Markdown content={introText} />
    </div>
  )
}

/** The layout size — mirrors `InsightCardData['variant']` without the optional. */
export type Variant = NonNullable<InsightCardData['variant']>

/**
 * The one place the four card layouts (hero / wide / tall / compact) are
 * arranged. Each layout is prose-first: an `introText` region (which fades when
 * it overflows) plus a floating "Full Insight" CTA bottom-right. Only `hero` and
 * `wide` also render a `widget` (the visual ReactNode; `null` when unresolved);
 * `tall`/`compact` are introText-only. The intro region carries bottom padding
 * so its last line clears the floating CTA.
 */
export function CardScaffold({
  variant = 'hero',
  introText,
  prompt,
  widget,
}: {
  variant?: Variant
  introText: string
  prompt?: string
  widget: ReactNode
}) {
  if (variant === 'wide') {
    return (
      <Frame radius="rounded-2xl" padding="p-3.5">
        <div className="flex h-full items-stretch gap-3">
          <IntroText introText={introText} className="w-[75%] min-w-0 pb-8" />
          <div className="min-h-0 flex-1">{widget}</div>
        </div>
        <div className="absolute bottom-3 right-3">
          <CtaButton prompt={prompt} />
        </div>
      </Frame>
    )
  }

  if (variant === 'tall') {
    return (
      <Frame radius="rounded-2xl" padding="p-3.5">
        <IntroText introText={introText} className="h-full pb-10" />
        <div className="absolute bottom-3 right-3">
          <CtaButton prompt={prompt} />
        </div>
      </Frame>
    )
  }

  if (variant === 'compact') {
    return (
      <Frame radius="rounded-2xl" padding="p-3.5">
        <IntroText introText={introText} className="h-full pb-9" />
        <div className="absolute bottom-3 right-3">
          <CtaButton prompt={prompt} icon />
        </div>
      </Frame>
    )
  }

  // hero — the carousel's full-bleed slide: introText on top, widget below with
  // the floating CTA overlapping the widget's bottom-right corner (image #1). The
  // intro sizes to its content but never past the top half (`max-h-[50%]`,
  // fading if it does); a short intro lets the widget region grow to fill the
  // rest, with the widget centered vertically within it.
  return (
    <Frame radius="rounded-3xl" padding="p-5">
      <IntroText introText={introText} className="max-h-[50%] pb-1" />
      <div className="relative min-h-0 flex-1">{widget}</div>
      <div className="absolute bottom-4 right-4">
        <CtaButton prompt={prompt} />
      </div>
    </Frame>
  )
}

/**
 * The fallback card, rendered when the payload is too malformed to resolve
 * (Team A's boundary path). Best-effort introText only — no widget, never
 * throws: it reads whatever `introText`/`prompt` it can find off the raw payload
 * and renders the scaffold with `widget={null}` so the slot degrades gracefully
 * instead of crashing or going blank.
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
  return (
    <CardScaffold
      variant={variant}
      introText={str(raw.introText) ?? 'Your latest AI insight is ready.'}
      prompt={str(raw.prompt)}
      widget={null}
    />
  )
}
