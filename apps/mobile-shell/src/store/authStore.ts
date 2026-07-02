import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { AuthSession, AuthUser } from '../types'

interface AuthState {
  token: string | null
  user: AuthUser | null
  setSession: (session: AuthSession) => void
  logout: () => void
}

/**
 * Mock auth session. Persisted to sessionStorage (mirrors the web app's chat
 * store) so a page refresh keeps you signed in, but closing the tab signs you
 * out — appropriate for a fake, backendless session.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setSession: ({ token, user }) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: 'bank-shell-auth',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
)
