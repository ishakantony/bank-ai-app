/**
 * @bank-poc/blocks-kit — the shared presentational toolkit for custom blocks.
 * Both the web host's local blocks and the federated block remotes import their
 * framed surface, fallback/skeleton chrome, and accent palette from here, so a
 * block looks identical wherever it is built and deployed.
 *
 * Consumed as raw TS/TSX source (no build step), like @bank-poc/shared: each
 * consumer's bundler transpiles it. Relative imports carry explicit extensions
 * for consistency with the shared package's convention.
 */
export * from './BlockCard.tsx'
export * from './BlockFallback.tsx'
export * from './ComponentSkeleton.tsx'
export * from './colors.ts'
export * from './blockDoc.ts'
