import { lazy, type ComponentType, type LazyExoticComponent } from 'react'
import { z } from 'zod'

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
 *
 * Each block folder's `index.ts` calls this with its co-located schema and a
 * dynamic import of its component; `registry.ts` auto-discovers those modules.
 */
export function defineBlock<S extends z.ZodTypeAny>(
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
