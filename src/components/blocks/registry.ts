import { lazy, type ComponentType, type LazyExoticComponent } from 'react'
import { z } from 'zod'
import {
  actionCardSchema,
  allocationDonutSchema,
  driftBarsSchema,
  spendBreakdownSchema,
  spendDonutSchema,
  spendTrendSchema,
  suggestionsSchema,
  wizardSchema,
} from './schemas'

/**
 * A registered custom block: a Zod schema describing its accepted data and a
 * lazily-imported component that renders validated data. Types are erased to
 * `unknown` here so the registry can hold many heterogeneous blocks in one map;
 * `defineBlock` re-establishes the schema↔component type link at registration.
 */
export interface BlockDefinition {
  schema: z.ZodType<unknown>
  Component: LazyExoticComponent<ComponentType<{ data: unknown }>>
}

/**
 * Register a block, tying the component's `data` prop to the schema's inferred
 * output so a mismatch is a compile error. The component is code-split via the
 * dynamic-import loader, keeping it (and Recharts) out of the initial bundle.
 */
function defineBlock<S extends z.ZodTypeAny>(
  schema: S,
  loader: () => Promise<{ default: ComponentType<{ data: z.infer<S> }> }>,
): BlockDefinition {
  return {
    schema: schema as unknown as z.ZodType<unknown>,
    Component: lazy(loader) as LazyExoticComponent<
      ComponentType<{ data: unknown }>
    >,
  }
}

/**
 * The block registry. Adding a component is a single declarative line here —
 * this scales to many blocks without growing the initial bundle, since each
 * entry is loaded on demand the first time a response uses it.
 */
export const blockRegistry: Record<string, BlockDefinition> = {
  allocationDonut: defineBlock(
    allocationDonutSchema,
    () => import('./AllocationDonut'),
  ),
  driftBars: defineBlock(driftBarsSchema, () => import('./DriftBars')),
  spendTrend: defineBlock(spendTrendSchema, () => import('./SpendTrend')),
  spendDonut: defineBlock(spendDonutSchema, () => import('./SpendDonut')),
  spendBreakdown: defineBlock(
    spendBreakdownSchema,
    () => import('./SpendBreakdown'),
  ),
  actionCard: defineBlock(actionCardSchema, () => import('./ActionCard')),
  suggestions: defineBlock(suggestionsSchema, () => import('./Suggestions')),
  wizard: defineBlock(wizardSchema, () => import('./WizardCard')),
}
