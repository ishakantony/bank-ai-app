import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
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
