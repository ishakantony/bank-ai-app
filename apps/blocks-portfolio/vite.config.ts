import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { federation } from '@module-federation/vite'

// The "portfolio" block remote: an independently-deployable Module Federation
// provider that exposes each portfolio block as `{ schema, Component }`. The web
// host discovers this remote's URL from the backend manifest at runtime and
// loads blocks on demand — so this package can ship on its own cadence.
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    federation({
      name: 'blocksPortfolio',
      filename: 'remoteEntry.js',
      exposes: {
        './portfolioValue': './src/portfolio-value.ts',
        './holdingsTable': './src/holdings-table.ts',
        './allocationRing': './src/allocation-ring.ts',
        // Docs metadata for the host's /docs gallery + playground. The remote
        // owns its documentation alongside its blocks.
        './docs': './src/docs.ts',
      },
      // The host consumes these blocks at runtime (Zod-validated), not via
      // generated types, so skip DTS emission.
      dts: false,
      // Shared with the host as singletons: React (hooks/context must be one
      // instance) plus recharts and zod (deduped — the remote consumes the
      // host's copy at runtime rather than shipping its own).
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
        recharts: { singleton: true },
        zod: { singleton: true },
      },
    }),
  ],
  // Cross-origin dynamic import of remoteEntry.js from the host (:9999) needs
  // CORS in dev; a prod CDN must set the same.
  server: { port: 9997, cors: true },
  // Module Federation emits top-level await; esnext keeps it.
  build: { target: 'esnext' },
})
