import { useRef, useState } from 'react'
import { ArrowUpRight, Newspaper } from 'lucide-react'
import type { PromoCard } from '../../types'

export function PromoCarousel({ promos }: { promos: PromoCard[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  function handleScroll() {
    const el = scrollerRef.current
    if (!el) return
    // Each card snaps to the scroller's left edge; index ≈ scroll / card width.
    const cardWidth = el.scrollWidth / promos.length
    setActive(Math.round(el.scrollLeft / cardWidth))
  }

  return (
    <div>
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1"
      >
        {promos.map((promo) =>
          promo.kind === 'news' ? (
            <NewsTile key={promo.id} promo={promo} />
          ) : (
            <OfferTile key={promo.id} promo={promo} />
          ),
        )}
      </div>

      <div className="mt-3 flex justify-center gap-1.5">
        {promos.map((promo, i) => (
          <span
            key={promo.id}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === active ? 'w-5 bg-brand-1' : 'w-1.5 bg-ink-soft/30'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

/** Shared sizing so two cards sit side-by-side and peek the next, like the ref. */
const CARD =
  'group relative flex min-h-[116px] w-[47%] shrink-0 snap-start flex-col overflow-hidden rounded-2xl text-left transition active:scale-[0.99]'

/** Dark, photo-style news card with a watermark thumb and corner arrow. */
function NewsTile({ promo }: { promo: PromoCard }) {
  return (
    <button
      type="button"
      className={`${CARD} justify-between p-3.5`}
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
      <p className="relative mt-2 pr-6 text-[13px] font-semibold leading-snug text-white">
        {promo.title}
      </p>
      <span className="absolute bottom-3 right-3 grid size-7 place-items-center rounded-full bg-white/25 text-white backdrop-blur-sm transition group-hover:bg-white/40">
        <ArrowUpRight className="size-4" strokeWidth={2.2} />
      </span>
    </button>
  )
}

/** White offer card: text on the left, a rounded emoji "photo" tile on the right. */
function OfferTile({ promo }: { promo: PromoCard }) {
  return (
    <button type="button" className={`${CARD} glass p-3.5`}>
      <span
        aria-hidden
        className="absolute right-3 top-3 grid size-11 place-items-center rounded-xl bg-gradient-to-br from-glow-peach/60 to-glow-violet/50 text-2xl shadow-inner"
      >
        {promo.thumb}
      </span>
      <p className="relative pr-14 text-[11px] font-semibold uppercase tracking-wide text-brand-1">
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
