import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { federation } from '@module-federation/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Module Federation host. This shell renders no remote blocks yet, but the
    // runtime + shared scope are initialized now so a remote MFE can be loaded
    // later with zero build changes: remotes are discovered from the backend
    // manifest and registered at runtime (see main.tsx / src/blocks/registry.ts),
    // never listed statically here. React/react-dom/zod are shared as singletons
    // so a future remote reuses the host's copies rather than bundling its own.
    federation({
      name: 'shell',
      remotes: {},
      // Cross-boundary types aren't generated — the host validates a remote
      // block's data at runtime with the Zod schema the remote ships. Disabling
      // DTS also avoids the plugin probing for a tsconfig it doesn't need.
      dts: false,
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
        zod: { singleton: true },
      },
    }),
  ],
  // Module Federation emits top-level await; esnext keeps it.
  build: { target: 'esnext' },
  server: {
    port: 9990,
    // In a future `real` API mode MSW would be disabled and /api would fall
    // through to a backend; in mock mode the service worker intercepts first,
    // so this proxy is harmlessly unused.
    proxy: {
      '/api': {
        target: `http://localhost:${process.env.PORT ?? 8787}`,
        changeOrigin: true,
      },
    },
  },
})
