import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'
import { fetchBlockRemotes } from './api/blockRemotes'
import { prefetchBlocks, registerRemoteBlocks } from './blocks/registry'

const queryClient = new QueryClient()

async function enableMocking() {
  if (!import.meta.env.DEV) return
  // The shell runs entirely off MSW (no backend). Skip the worker only if a
  // future `real` mode is set, so /api calls fall through the Vite proxy.
  if (import.meta.env.VITE_API_MODE === 'real') return
  const { worker } = await import('./mocks/browser')
  await worker.start({ onUnhandledRequest: 'bypass' })
}

// Discover federated block remotes from the backend and register them before
// the first render. The shell renders no blocks yet (the manifest is empty),
// but this keeps it MFE-ready: a remote can be added backend-side with no host
// change. Runs after mocking so MSW can intercept, and never blocks boot.
async function registerBlocks() {
  try {
    registerRemoteBlocks(await fetchBlockRemotes())
    // Warm the above-the-fold carousel + insight card in parallel with
    // /api/dashboard + /api/promos, so the (post-code-split, recharts-free) base
    // chunks are cached by the time RemoteAiCard mounts — collapsing the serial
    // boot → dashboard → carousel → promos → manifest → loadRemote waterfall.
    // Not awaited: must never delay first paint.
    prefetchBlocks(['promoCarousel', 'insightCard'])
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn('[blocks] failed to register remotes', err)
    }
  }
}

enableMocking()
  .then(registerBlocks)
  .then(() => {
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
