import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AnimatedBackground } from './components/AnimatedBackground'
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
        <Route
          path="/"
          element={
            <RequireAuth>
              <HomePage />
            </RequireAuth>
          }
        />
        {(['payments', 'invest', 'discover', 'services'] as const).map((tab) => (
          <Route
            key={tab}
            path={`/${tab}`}
            element={
              <RequireAuth>
                <PlaceholderPage tab={tab} />
              </RequireAuth>
            }
          />
        ))}
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
