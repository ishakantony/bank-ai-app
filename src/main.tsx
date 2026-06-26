import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'

const queryClient = new QueryClient()

async function enableMocking() {
  if (!import.meta.env.DEV) return
  // Two interchangeable backends: the MSW mock (default) and the real Hono
  // server. `VITE_API_MODE=real` skips the worker so /api calls fall through
  // the Vite proxy to Hono. Same /api/* paths in both modes.
  if (import.meta.env.VITE_API_MODE === 'real') return
  const { worker } = await import('./mocks/browser')
  await worker.start({ onUnhandledRequest: 'bypass' })
}

enableMocking().then(() => {
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
