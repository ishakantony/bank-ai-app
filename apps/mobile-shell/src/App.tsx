import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AnimatedBackground } from './components/AnimatedBackground'
import { AppShell } from './components/AppShell'
import { RequireAuth } from './components/RequireAuth'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { HomePage } from './pages/HomePage'
import { PlaceholderPage } from './pages/PlaceholderPage'

export default function App() {
  return (
    <>
      <AnimatedBackground />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        {/* Shared layout: AppShell (and its BottomNav) mounts once and persists
            across these routes, so the active-pill animation runs on every nav. */}
        <Route
          element={
            <RequireAuth>
              <AppShell />
            </RequireAuth>
          }
        >
          <Route path="/" element={<HomePage />} />
          {(['payments', 'invest', 'discover', 'services'] as const).map(
            (tab) => (
              <Route
                key={tab}
                path={`/${tab}`}
                element={<PlaceholderPage tab={tab} />}
              />
            ),
          )}
        </Route>
      </Routes>
      {/* Light-glass toasts. Offset clears the floating bottom nav. */}
      <Toaster
        position="top-center"
        toastOptions={{
          unstyled: true,
          classNames: {
            toast:
              'glass flex items-center gap-3 w-full rounded-2xl px-4 py-3 text-sm font-medium text-ink',
            error: 'text-tone-negative',
          },
        }}
      />
    </>
  )
}
