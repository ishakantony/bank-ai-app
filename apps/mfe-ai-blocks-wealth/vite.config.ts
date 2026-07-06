import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { federation } from '@module-federation/vite'

// The "wealth" block remote: an independently-deployable Module Federation
// provider that owns the idle-cash / investing blocks — the interactive
// `wizard` (card + drawer) plus the presentational allocationDonut / driftBars
// / actionCard. The web host discovers this remote's URL from the backend
// manifest at runtime and loads blocks on demand, so this package ships on its
// own cadence.
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    federation({
      name: 'blocksWealth',
      filename: 'remoteEntry.js',
      exposes: {
        './wizard': './src/wizard.ts',
        './allocationDonut': './src/allocation-donut.ts',
        './driftBars': './src/drift-bars.ts',
        './actionCard': './src/action-card.ts',
        // Docs metadata for the host's /docs gallery + playground. The remote
        // owns its documentation alongside its blocks.
        './docs': './src/docs.ts',
      },
      // The host consumes these blocks at runtime (Zod-validated), not via
      // generated types, so skip DTS emission.
      dts: false,
      // Shared with the host as singletons: React (hooks/context must be one
      // instance), recharts + zod (deduped from the host's copies), and
      // `@bank-poc/blocks-runtime` (+ zustand) so the block bus, thread context
      // and chat bridge are ONE instance across host + remotes — the wizard the
      // remote ships must register into the same bus the host reads.
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
        recharts: { singleton: true },
        zod: { singleton: true },
        zustand: { singleton: true },
        '@bank-poc/blocks-runtime': { singleton: true },
      },
    }),
  ],
  // Cross-origin dynamic import of remoteEntry.js from the host (:9999) needs
  // CORS in dev; a prod CDN must set the same.
  server: { port: 9996, cors: true },
  // Module Federation emits top-level await; esnext keeps it.
  build: { target: 'esnext' },
})
