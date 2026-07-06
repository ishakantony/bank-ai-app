import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { Sparkles } from 'lucide-react'
import type { InsightCardData } from './schema'

// The Bank AI chat app the card deep-links into. Same default the shell's
// "Your Banking Summary" row uses; overridable per remote deployment.
const AI_SHELL_URL = import.meta.env.VITE_AI_SHELL_URL ?? 'http://localhost:9999'

/**
 * Deep-link into the chat app and start a conversation. Mirrors the shell's
 * BankingSummaryCard: `?topic=` opens a specific thread (e.g. an insight),
 * `?message=` seeds the first message; with neither it's a plain regular chat.
 * The remote runs inside the shell page, so `window.open` opens the AI shell.
 */
function openChat(data: InsightCardData) {
  const url = new URL('/chat', AI_SHELL_URL)
  if (data.topic) url.searchParams.set('topic', data.topic)
  if (data.prompt) url.searchParams.set('message', data.prompt)
  window.open(url.toString(), '_blank', 'noopener,noreferrer')
}

// Bright bar colors that pop on the deep-blue gradient card (matches the shell's
// insight aesthetic). Cycled across categories, largest-first.
const BARS = ['#5fe3ff', '#b79bff', '#74e6a6', '#ffd36b', '#ff9bb0']

const MYR_WHOLE = new Intl.NumberFormat('en-MY', { maximumFractionDigits: 0 })

/** Badge tint per tone, drawn on the deep card. */
const TONE: Record<NonNullable<InsightCardData['deltaTone']>, string> = {
  positive: 'bg-tone-positive/25 text-tone-positive-fg',
  negative: 'bg-tone-negative/25 text-tone-negative-fg',
  warning: 'bg-tone-warning/25 text-tone-warning-fg',
  info: 'bg-tone-info/25 text-tone-info-fg',
}

/** Largest category first so the bars read as a ranked breakdown. */
function ranked(data: InsightCardData) {
  return [...data.categories]
    .sort((a, b) => b.amount - a.amount)
    .map((c) => ({ label: c.label, amount: c.amount }))
}

function money(currency: string | undefined, n: number) {
  return `${currency ?? 'RM'}${MYR_WHOLE.format(n)}`
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
function Delta({ data, small }: { data: InsightCardData; small?: boolean }) {
  if (!data.delta) return null
  return (
    <span
      className={`shrink-0 rounded-full font-semibold ${TONE[data.deltaTone ?? 'warning']} ${
        small ? 'px-2 py-0.5 text-[9px]' : 'px-2.5 py-1 text-[11px]'
      }`}
    >
      {data.delta}
    </span>
  )
}

/** Horizontal category bars. `labels` draws the axis labels (hero only). */
function Bars({
  data,
  labels,
}: {
  data: { label: string; amount: number }[]
  labels?: boolean
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 0, right: labels ? 8 : 2, bottom: 0, left: 0 }}
        barCategoryGap={labels ? '22%' : '16%'}
      >
        <XAxis type="number" hide domain={[0, 'dataMax']} />
        <YAxis
          type="category"
          dataKey="label"
          hide={!labels}
          axisLine={false}
          tickLine={false}
          width={72}
          interval={0}
          tick={{ fill: 'rgba(255,255,255,0.8)', fontSize: 11 }}
        />
        <Bar dataKey="amount" radius={[3, 3, 3, 3]} isAnimationActive={false}>
          {data.map((_, i) => (
            <Cell key={i} fill={BARS[i % BARS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
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
  children: React.ReactNode
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
  data,
  icon,
}: {
  data: InsightCardData
  icon?: boolean
}) {
  if (icon) {
    return (
      <button
        type="button"
        aria-label={data.cta ?? 'Open in Bank AI'}
        onClick={() => openChat(data)}
        className="grid size-8 shrink-0 place-items-center rounded-full bg-ink/85 text-white backdrop-blur-md transition hover:bg-ink active:scale-[0.95]"
      >
        <Sparkles className="size-4 text-brand-3" strokeWidth={2.2} />
      </button>
    )
  }
  return (
    <button
      type="button"
      onClick={() => openChat(data)}
      className="inline-flex items-center gap-1.5 rounded-full bg-ink/85 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-ink active:scale-[0.98]"
    >
      {data.cta ?? 'Full Insight'}
      <Sparkles className="size-4 text-brand-3" strokeWidth={2.2} />
    </button>
  )
}

/** Full-bleed hero (the carousel's `full` slide). */
function Hero({ data }: { data: InsightCardData }) {
  return (
    <Frame radius="rounded-3xl" padding="p-5">
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <Eyebrow period={data.period} />
          <p className="num mt-1.5 text-2xl font-semibold">
            {money(data.currency, data.amount)}
          </p>
        </div>
        <Delta data={data} />
      </div>
      <p className="relative mt-1.5 text-[12.5px] leading-snug text-white/85">
        {data.headline}
      </p>
      <div className="relative mt-2 min-h-0 flex-1">
        <Bars data={ranked(data)} labels />
      </div>
      <div className="relative mt-2 flex justify-end">
        <CtaButton data={data} />
      </div>
    </Frame>
  )
}

/** Wide horizontal banner — lead cell of a `top`-layout bento (col-span-2). */
function Wide({ data }: { data: InsightCardData }) {
  return (
    <Frame radius="rounded-2xl" padding="p-3.5">
      <div className="relative flex h-full items-stretch gap-3">
        <div className="flex min-w-0 flex-1 flex-col">
          <Eyebrow period={data.period} small />
          <p className="num mt-0.5 text-xl font-semibold leading-tight">
            {money(data.currency, data.amount)}
          </p>
          <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-white/80">
            {data.headline}
          </p>
          <div className="mt-auto pt-1">
            <Delta data={data} small />
          </div>
        </div>
        <div className="flex w-[42%] shrink-0 flex-col">
          <div className="min-h-0 flex-1">
            <Bars data={ranked(data)} />
          </div>
          <div className="mt-1 flex justify-end">
            <CtaButton data={data} icon />
          </div>
        </div>
      </div>
    </Frame>
  )
}

/** Tall portrait banner — lead cell of a `left`-layout bento (row-span-2). */
function Tall({ data }: { data: InsightCardData }) {
  return (
    <Frame radius="rounded-2xl" padding="p-3.5">
      <div className="relative flex items-start justify-between gap-2">
        <Eyebrow period={data.period} small />
        <Delta data={data} small />
      </div>
      <p className="num relative mt-1 text-xl font-semibold leading-tight">
        {money(data.currency, data.amount)}
      </p>
      <p className="relative mt-1 line-clamp-3 text-[11px] leading-snug text-white/80">
        {data.headline}
      </p>
      <div className="relative mt-2 min-h-0 flex-1">
        <Bars data={ranked(data)} />
      </div>
      <div className="relative mt-1 flex justify-end">
        <CtaButton data={data} icon />
      </div>
    </Frame>
  )
}

/** Compact square banner — a single bento cell alongside normal promo tiles. */
function Compact({ data }: { data: InsightCardData }) {
  return (
    <Frame radius="rounded-2xl" padding="p-3.5">
      <div className="relative flex items-start justify-between gap-2">
        <Eyebrow period={data.period} small />
        <Delta data={data} small />
      </div>
      <p className="num relative mt-1 text-xl font-semibold leading-tight">
        {money(data.currency, data.amount)}
      </p>
      <div className="relative mt-auto flex items-end gap-2">
        <div className="h-7 min-w-0 flex-1">
          <Bars data={ranked(data).slice(0, 3)} />
        </div>
        <CtaButton data={data} icon />
      </div>
    </Frame>
  )
}

/**
 * A Bank AI spend-insight card, owned by Team B and loaded into the mobile
 * carousel (Team A) via Module Federation. It validates its `data` against the
 * exposed schema (in `insight-card.ts`) then renders a size-appropriate layout
 * so the same card can be the full-bleed hero OR a bento tile (wide / tall /
 * compact), letting a bento mix normal promo banners with AI banners. The
 * carousel never reads `variant` — it just sizes the cell; the card adapts.
 *
 * Every variant fills its container (`h-full w-full`). MYR / Malaysia-flavored.
 */
export default function InsightCard({ data }: { data: InsightCardData }) {
  switch (data.variant ?? 'hero') {
    case 'wide':
      return <Wide data={data} />
    case 'tall':
      return <Tall data={data} />
    case 'compact':
      return <Compact data={data} />
    default:
      return <Hero data={data} />
  }
}
