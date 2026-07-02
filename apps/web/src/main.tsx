import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'
import { fetchBlockRemotes } from './api/blockRemotes'
import { registerRemoteBlocks } from './components/blocks/registry'
import { setChatSend } from '@bank-ai/blocks-runtime'
import { useChatStore } from './store/chatStore'

const queryClient = new QueryClient()

// Bind the block runtime's send-bridge to the chat store, so a block (local or
// federated, e.g. the wizard drawer) can post into a thread without importing
// the host store. The store action is stable, so this one-time wiring suffices.
setChatSend((threadId, text) => useChatStore.getState().sendMessage(threadId, text))

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

// Discover federated block remotes from the backend and register them before
// the first render, so a ```bank:<name>``` fence resolves whether the block is
// compiled in or hosted by a remote. Runs after mocking is ready (so MSW can
// intercept the request in mock mode) and never blocks boot on failure — a
// missing manifest just leaves remote blocks unregistered (they degrade to the
// inline fallback).
async function registerBlocks() {
  try {
    registerRemoteBlocks(await fetchBlockRemotes())
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn('[blocks] failed to register remotes', err)
    }
  }
}

Promise.all([enableEruda(), enableMocking()])
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
