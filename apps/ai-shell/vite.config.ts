import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { federation } from '@module-federation/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Module Federation host. Remotes are NOT listed here — they're fetched
    // from the backend manifest and registered at runtime (see main.tsx /
    // blocks/registry.ts). This plugin just initializes the MF runtime and the
    // shared-module scope; React is shared as a singleton so remote blocks use
    // the host's React instance.
    federation({
      name: 'host',
      remotes: {},
      // Cross-boundary types aren't generated: the host treats remote block
      // modules as `unknown` and validates data at runtime with the schema the
      // remote ships. Disabling DTS also avoids the plugin probing for a
      // (non-existent) apps/ai-shell/tsconfig.json.
      dts: false,
      // React must be one instance across the boundary (hooks/context). recharts
      // and zod are shared as singletons too so a remote reuses the host's copy
      // instead of bundling its own — the host already ships them for its local
      // blocks, so remote chunks stay small. `@bank-poc/blocks-runtime` (+ its
      // zustand dep) is a singleton so the block bus, thread context and chat
      // bridge are ONE instance across host + remotes — a remote's wizard must
      // register into the same bus the host's BlockOverlayHost reads.
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
  // Module Federation emits top-level await; esnext keeps it.
  build: { target: 'esnext' },
  server: {
    port: 9999,
    // In `real` API mode MSW is disabled, so /api falls through to the Hono
    // server. In mock mode the service worker intercepts first, so this proxy
    // is harmlessly unused.
    proxy: {
      '/api': {
        target: `http://localhost:${process.env.PORT ?? 8787}`,
        changeOrigin: true,
      },
    },
  },
})
