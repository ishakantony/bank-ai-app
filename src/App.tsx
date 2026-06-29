import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { WelcomePage } from './pages/WelcomePage'
import { ChatPage } from './pages/ChatPage'
import { AnimatedBackground } from './components/AnimatedBackground'

// The docs gallery/playground are a URL-only side route; lazy-load so their
// sample/doc content stays out of the main app bundle.
const DocsPage = lazy(() =>
  import('./pages/DocsPage').then((m) => ({ default: m.DocsPage })),
)

export default function App() {
  return (
    <>
      <AnimatedBackground />
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route
          path="/docs"
          element={
            <Suspense fallback={null}>
              <DocsPage />
            </Suspense>
          }
        />
      </Routes>
      {/* Offset clears the bottom-pinned chat input + footer. Unstyled so the
          glassmorphism classes fully replace sonner's default solid card. */}
      <Toaster
        position="bottom-center"
        offset="7rem"
        toastOptions={{
          unstyled: true,
          classNames: {
            toast:
              'flex items-center gap-3 w-full rounded-[1.3rem] border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium text-white shadow-lg backdrop-blur-xl',
          },
        }}
      />
    </>
  )
}
