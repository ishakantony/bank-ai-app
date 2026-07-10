import type { ComponentType } from 'react'
import type { z } from 'zod'
import type { Variant } from '../card-chrome'

/** Props every widget `Visual` receives: its parsed data + the card variant. */
export interface WidgetProps<Data> {
  data: Data
  variant: Variant
}

/**
 * A card body kind. Each widget owns its own standalone data schema (only its
 * own visual fields — no shared chrome) and a `Visual` that renders the body for
 * a given variant. Only `hero`/`wide` render a widget, so `Visual` only needs to
 * look good at those two sizes.
 *
 * The card resolves `widget` → a `Widget`, validates `widgetData` with `schema`,
 * and hands the parsed data to `Visual`. The generic `Data` is the inferred
 * shape, so `Visual` sees a fully-typed payload while the registry holds widgets
 * under a common type.
 */
export interface Widget<Data = unknown> {
  schema: z.ZodType<Data>
  // A `ComponentType` (not a bare function type) so both a plain function
  // component and a `React.lazy(...)` (`LazyExoticComponent`) satisfy it — the
  // recharts-heavy widgets lazy-load their `Visual` to keep recharts out of the
  // base card chunk (see donut.tsx / categories.tsx).
  Visual: ComponentType<WidgetProps<Data>>
}

/**
 * Helper to define a widget while keeping its `Data` bound to the schema — so a
 * widget's `Visual` is typed against exactly what its schema parses, and the
 * result still fits the registry's `Widget` (erased to `unknown`).
 */
export function defineWidget<Data>(widget: Widget<Data>): Widget {
  return widget as unknown as Widget
}
