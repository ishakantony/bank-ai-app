import { Loader2 } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  children: ReactNode
}

/** The brand-gradient pill button used for primary actions (auth submit, CTAs). */
export function PrimaryButton({
  loading,
  children,
  disabled,
  className = '',
  ...rest
}: PrimaryButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`relative flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-brand-1 to-brand-2 px-4 py-3.5 text-[15px] font-semibold text-white shadow-[0_14px_34px_-14px_var(--color-brand-2)] transition duration-200 enabled:hover:brightness-105 enabled:active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : null}
      {children}
    </button>
  )
}
