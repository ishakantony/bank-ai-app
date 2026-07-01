import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'

const queryClient = new QueryClient()

// Eruda — an on-screen devtools console for debugging inside mobile webviews
// where no remote inspector is available. Lazy-imported so it never lands in
// the main bundle. Loads in dev, or on demand in any build via `?eruda` in the
// URL or `localStorage.eruda = '1'` (sticky, so it survives navigation).
async function enableEruda() {
  const params = new URLSearchParams(window.location.search)
  if (params.get('eruda') === '0') localStorage.removeItem('eruda')
  else if (params.has('eruda')) localStorage.setItem('eruda', '1')

  const wanted = import.meta.env.DEV || localStorage.getItem('eruda') === '1'
  if (!wanted) return

  const { default: eruda } = await import('eruda')
  eruda.init()
}

async function enableMocking() {
  if (!import.meta.env.DEV) return
  // Two interchangeable backends: the MSW mock (default) and the real Hono
  // server. `VITE_API_MODE=real` skips the worker so /api calls fall through
  // the Vite proxy to Hono. Same /api/* paths in both modes.
  if (import.meta.env.VITE_API_MODE === 'real') return
  const { worker } = await import('./mocks/browser')
  await worker.start({ onUnhandledRequest: 'bypass' })
}

Promise.all([enableEruda(), enableMocking()]).then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </StrictMode>,
  )
})
