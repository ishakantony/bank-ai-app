/**
 * @bank-poc/shared — the contract layer shared by the web app and the Hono
 * server. Holds the domain types and every custom block's Zod schema (the
 * single source of truth for each block's data shape). Consumed as raw TS
 * source (no build step): the web app resolves it via Vite and the server via
 * Node's native type stripping.
 *
 * Relative imports carry explicit `.ts` extensions so Node's runtime ESM
 * resolver (used by the server) can load them; Vite/tsc accept this via
 * `allowImportingTsExtensions`.
 */
export * from './types.ts'

export * from './blocks/actionCard.ts'
export * from './blocks/allocationDonut.ts'
export * from './blocks/allocationRing.ts'
export * from './blocks/driftBars.ts'
export * from './blocks/holdingsTable.ts'
export * from './blocks/portfolioValue.ts'
export * from './blocks/spendBreakdown.ts'
export * from './blocks/spendDonut.ts'
export * from './blocks/spendTrend.ts'
export * from './blocks/suggestions.ts'
export * from './blocks/wizard.ts'
