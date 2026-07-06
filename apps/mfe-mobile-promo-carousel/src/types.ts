/**
 * Local domain types for the promo carousel widget. Copied from the shell so
 * the remote is fully self-contained — it defines the shape of the `/api/promos`
 * payload it fetches and validates itself (see PromoCarousel.tsx).
 */

export interface PromoCard {
  id: string
  kind: 'news' | 'offer'
  eyebrow: string
  title: string
  /** Optional emphasized fragment shown inline (e.g. "8%"). */
  highlight?: string
  /** Emoji used as the card's illustrative thumbnail (stands in for a photo). */
  thumb?: string
}

/** One slice of the monthly-spend donut on the insight hero card. */
export interface DonutSlice {
  label: string
  value: number
}

export interface SpendInsight {
  amount: number
  month: string
  deltaPct: number
  blurb: string
  donut: DonutSlice[]
}
