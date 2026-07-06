import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { federation } from '@module-federation/vite'

// The "promo carousel" remote: an independently-deployable Module Federation
// provider that exposes the home-screen promo carousel as a self-fetching
// widget. Unlike the block remotes (which expose `{ schema, Component }` and let
// the host pass data), this remote owns its data too — the host mounts
// `<Component />` with no props and the widget fetches `/api/promos` itself.
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    federation({
      name: 'promoCarousel',
      filename: 'remoteEntry.js',
      exposes: {
        // Exposes `{ Component }` (no schema) — the host supplies no data.
        './promoCarousel': './src/promo-carousel.ts',
      },
      // The host mounts this widget at runtime; there's no cross-boundary data
      // contract to type, so skip DTS emission.
      dts: false,
      // Shared with the host as singletons: React (hooks/context must be one
      // instance) plus zod (deduped — the remote validates its fetched payload
      // with the host's copy rather than shipping its own).
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
        zod: { singleton: true },
      },
    }),
  ],
  // Cross-origin dynamic import of remoteEntry.js from the host needs CORS in
  // dev; a prod CDN must set the same.
  server: { port: 9995, cors: true },
  // Module Federation emits top-level await; esnext keeps it.
  build: { target: 'esnext' },
})
