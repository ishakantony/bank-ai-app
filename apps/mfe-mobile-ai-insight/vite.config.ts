import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { federation } from '@module-federation/vite'

// The "mobile AI insight" block remote (Team B): an independently-deployable
// Module Federation provider that exposes rich AI insight cards as
// `{ schema, Component }`. The mobile shell's promo carousel (Team A) delegates
// rendering to these cards at runtime — resolving the block id via the backend
// manifest and loading it here — so new AI cards ship on Team B's cadence with
// zero carousel code changes.
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    federation({
      name: 'mobileAiInsight',
      filename: 'remoteEntry.js',
      exposes: {
        // Each AI card is exposed as `{ schema, Component }` — the carousel
        // validates the feed's opaque `data` against the schema before render.
        './insightCard': './src/insight-card.ts',
        // Docs metadata, in the AI remotes' `./docs` convention (optional).
        './docs': './src/docs.ts',
      },
      // The carousel consumes these cards at runtime (Zod-validated), not via
      // generated types, so skip DTS emission.
      dts: false,
      // Shared as singletons: React (hooks/context must be one instance) plus
      // zod (validation must run against one Zod). The mobile shell shares only
      // react/react-dom/zod — NOT recharts — so this remote bundles and serves
      // its own recharts as the singleton for its own render tree.
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
        recharts: { singleton: true },
        zod: { singleton: true },
      },
    }),
  ],
  // Cross-origin dynamic import of remoteEntry.js from the shell (:9990) needs
  // CORS in dev; a prod CDN must set the same.
  server: { port: 9994, cors: true },
  // Module Federation emits top-level await; esnext keeps it.
  build: { target: 'esnext' },
})
