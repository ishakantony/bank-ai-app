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

/**
 * An AI card in the feed — for the insight slot OR any bento cell. The carousel
 * treats it opaquely: it delegates to a Team-B-owned federated card by `block`
 * id and passes `data` through untouched (`RemoteAiCard` resolves + validates
 * it). So a bento can mix normal promo banners with AI banners, and new AI cards
 * ship with no carousel change. `id` keys the tile in the bento grid.
 */
export interface AiTile {
  id: string
  kind: 'ai'
  block: string
  data: unknown
}

/** A single bento cell: a normal promo tile or a delegated AI banner. */
export type BentoTileData = PromoCard | AiTile

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
