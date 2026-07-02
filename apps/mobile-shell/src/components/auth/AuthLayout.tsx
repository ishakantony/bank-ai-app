import type { ReactNode } from 'react'
import { Orb } from '../Orb'

interface AuthLayoutProps {
  title: string
  subtitle: string
  children: ReactNode
  /** The switch-mode line at the bottom (e.g. "New here? Create account"). */
  footer: ReactNode
}

/**
 * Centered auth scaffold: the spinning brand orb + wordmark, a headline, and a
 * frosted glass panel holding the form. Scrolls on short viewports.
 */
export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="flex min-h-dvh w-full flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm animate-float-in">
        <div className="mb-6 flex flex-col items-center text-center">
          <Orb size={72} className="mb-4" />
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-1">
            Bank AI
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-ink">
            {title}
          </h1>
          <p className="mt-1.5 text-sm text-ink-soft">{subtitle}</p>
        </div>

        <div className="glass-strong rounded-3xl p-5">{children}</div>

        <div className="mt-5 text-center text-sm text-ink-soft">{footer}</div>
      </div>
    </div>
  )
}
