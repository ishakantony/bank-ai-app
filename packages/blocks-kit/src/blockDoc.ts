/**
 * Documentation metadata for one block, surfaced in the `/docs` gallery +
 * playground. Lives in the shared kit so a block remote can ship its own docs
 * (via a `./docs` expose) using the same shape the host understands.
 */
export interface BlockDoc {
  /** Human title shown above the examples. */
  title: string
  /** Short line shown on cards and matched by search. */
  summary: string
  /** Facet for grouping/filtering, e.g. "charts" | "spending" | "cards" | "interactive". */
  category: string
  /** Extra search tokens beyond the title/summary. */
  keywords?: string[]
  /** One or more named examples; `data` is the raw block JSON (an object). */
  examples: { label: string; caption?: string; data: unknown }[]
}
