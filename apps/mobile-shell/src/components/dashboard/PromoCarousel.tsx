import { useRef, useState, type ReactNode } from 'react'
import { ArrowUpRight, Newspaper } from 'lucide-react'
import type { PromoCard } from '../../types'

/**
 * One slide of the promo carousel. Each item in the `slides` array fully
 * describes what to render for that slide:
 *   - `full`  — a single full-bleed card (any node, e.g. the insight hero).
 *   - `bento` — three promo tiles in one of two arrangements:
 *       · `left` — one tall card on the left, two stacked on the right.
 *       · `top`  — one wide card on top, two side-by-side below.
 * In both bentos the FIRST tile is the large one.
 */
export type CarouselSlide =
  | { kind: 'full'; card: ReactNode }
  | { kind: 'bento'; layout: 'left' | 'top'; tiles: PromoCard[] }

/** In a bento, only the lead (first) tile spans; the rest fill single cells. */
const LEAD_SPAN: Record<'left' | 'top', string> = {
  left: 'row-span-2',
  top: 'col-span-2',
}

/**
 * The full promo area above Quick Actions: a full-width snap carousel driven
 * entirely by the `slides` array — its length sets the number of slides and
 * the dot count, and each descriptor picks its own layout.
 */
export function PromoCarousel({ slides }: { slides: CarouselSlide[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  function handleScroll() {
    const el = scrollerRef.current
    if (!el || slides.length === 0) return
    // Each slide is exactly one scroller-width wide; index ≈ scroll / width.
    const slideWidth = el.scrollWidth / slides.length
    setActive(Math.round(el.scrollLeft / slideWidth))
  }

  return (
    <div>
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto"
      >
        {slides.map((slide, i) => (
          <div key={i} className="h-60 w-full shrink-0 snap-start">
            {slide.kind === 'full' ? (
              slide.card
            ) : (
              <div className="grid h-full grid-cols-2 grid-rows-2 gap-3">
                {slide.tiles.map((promo, t) => (
                  <PromoTile
                    key={promo.id}
                    promo={promo}
                    className={t === 0 ? LEAD_SPAN[slide.layout] : ''}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-3 flex justify-center gap-1.5">
        {slides.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === active ? 'w-5 bg-brand-1' : 'w-1.5 bg-ink-soft/30'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

function PromoTile({
  promo,
  className = '',
}: {
  promo: PromoCard
  className?: string
}) {
  return promo.kind === 'news' ? (
    <NewsTile promo={promo} className={className} />
  ) : (
    <OfferTile promo={promo} className={className} />
  )
}

/** Base sizing: every tile fills its bento cell, with a corner arrow pinned. */
const TILE =
  'group relative flex h-full w-full flex-col overflow-hidden rounded-2xl p-3.5 text-left transition active:scale-[0.99]'

/** Dark, photo-style news card with a watermark thumb and corner arrow. */
function NewsTile({ promo, className }: { promo: PromoCard; className: string }) {
  return (
    <button
      type="button"
      className={`${TILE} ${className}`}
      style={{
        background:
          'linear-gradient(140deg, var(--color-brand-deep), var(--color-brand-1) 78%)',
      }}
    >
      {/* Oversized emoji reads as the article photo bleeding off the corner. */}
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-4 -right-3 text-6xl opacity-25 blur-[0.5px] grayscale"
      >
        {promo.thumb}
      </span>
      <div className="relative flex items-center gap-1.5 text-[10.5px] font-medium text-white/80">
        <Newspaper className="size-3.5" strokeWidth={2} />
        {promo.eyebrow}
      </div>
      <p className="relative mt-2 max-w-[85%] pr-6 text-[13px] font-semibold leading-snug text-white">
        {promo.title}
      </p>
      <span className="absolute bottom-3 right-3 grid size-7 place-items-center rounded-full bg-white/25 text-white backdrop-blur-sm transition group-hover:bg-white/40">
        <ArrowUpRight className="size-4" strokeWidth={2.2} />
      </span>
    </button>
  )
}

/** White offer card: text on the left, a rounded emoji "photo" tile on the right. */
function OfferTile({ promo, className }: { promo: PromoCard; className: string }) {
  return (
    <button type="button" className={`${TILE} glass ${className}`}>
      <span
        aria-hidden
        className="absolute right-3 top-3 grid size-10 place-items-center rounded-xl bg-gradient-to-br from-glow-peach/60 to-glow-violet/50 text-xl shadow-inner"
      >
        {promo.thumb}
      </span>
      <p className="relative pr-12 text-[11px] font-semibold uppercase tracking-wide text-brand-1">
        {promo.eyebrow}
      </p>
      <p className="relative mt-1.5 pr-2 text-[13px] font-medium leading-snug text-ink">
        {promo.highlight ? (
          <>
            Enjoy{' '}
            <span className="font-bold text-tone-positive">
              {promo.highlight}
            </span>{' '}
          </>
        ) : null}
        {promo.title}
      </p>
      <span className="absolute bottom-3 right-3 grid size-7 place-items-center rounded-full bg-brand-1/10 text-brand-1 transition group-hover:bg-brand-1/20">
        <ArrowUpRight className="size-4" strokeWidth={2.2} />
      </span>
    </button>
  )
}
