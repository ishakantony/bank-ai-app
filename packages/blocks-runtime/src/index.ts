// Barrel for the block runtime — the coordination layer shared (as a Module
// Federation singleton) between the web host and every block remote. Relative
// imports carry explicit `.ts` extensions so Node's ESM resolver can load the
// raw source without a build step.
export * from './blockBus.ts'
export * from './ChatThreadContext.ts'
export * from './chatBridge.ts'
