import { lazy, type ComponentType, type LazyExoticComponent } from 'react'
import { z } from 'zod'

/**
 * A block whose schema + component are compiled into this app (the classic
 * per-folder `blocks/<name>/` block). The schema is available synchronously so
 * incoming JSON is validated before the (code-split) component even loads.
 */
export interface LocalBlockDefinition {
  kind: 'local'
  schema: z.ZodType<unknown>
  Component: LazyExoticComponent<ComponentType<{ data: unknown }>>
  /** Optional plain-text serialization of the block's data, for copy. */
  toText?: (data: unknown) => string
}

/** The `{ schema, Component }` contract a federated remote exposes per block. */
export interface RemoteBlockModule {
  schema: z.ZodType<unknown>
  Component: ComponentType<{ data: unknown }>
  /** Optional plain-text serialization of the block's data, for copy. */
  toText?: (data: unknown) => string
}

/**
 * A block hosted by a Module Federation remote. Both its schema and component
 * arrive together when the remote chunk loads, so validation happens after the
 * (memoized) load rather than up front. Registered at runtime from the backend
 * manifest — see `registry.ts`.
 */
export interface RemoteBlockDefinition {
  kind: 'remote'
  load: () => Promise<RemoteBlockModule>
}

/**
 * A registered custom block. `CustomBlock` treats both variants uniformly:
 * parse JSON → validate against the schema → render the component, degrading to
 * a fallback on any failure. Types are erased to `unknown` so the registry can
 * hold many heterogeneous blocks in one map.
 */
export type BlockDefinition = LocalBlockDefinition | RemoteBlockDefinition

/**
 * Register a local block, tying the component's `data` prop to the schema's
 * inferred output so a mismatch is a compile error. The component is code-split
 * via the dynamic-import loader, keeping it (and Recharts) out of the initial
 * bundle. Each block folder's `index.ts` calls this with its co-located schema
 * and a dynamic import of its component; `registry.ts` auto-discovers them.
 */
export function defineBlock<S extends z.ZodTypeAny>(
  schema: S,
  loader: () => Promise<{ default: ComponentType<{ data: z.infer<S> }> }>,
  toText?: (data: z.infer<S>) => string,
): BlockDefinition {
  return {
    kind: 'local',
    schema: schema as unknown as z.ZodType<unknown>,
    Component: lazy(loader) as LazyExoticComponent<
      ComponentType<{ data: unknown }>
    >,
    toText: toText as ((data: unknown) => string) | undefined,
  }
}
