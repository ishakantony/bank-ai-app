import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuthStore } from '../store/authStore'

/**
 * Route guard: renders children only when a (mock) session exists, otherwise
 * redirects to /login, preserving the attempted path so login can bounce back.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const token = useAuthStore((s) => s.token)
  const location = useLocation()

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return <>{children}</>
}
