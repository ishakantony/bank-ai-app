import type { ReactNode } from 'react'

/**
 * Shared surface for custom blocks so every chart/card shares the same framed,
 * dark-glass look that fits the narrow chat column.
 */
export function BlockCard({
  title,
  children,
}: {
  title?: string
  children: ReactNode
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      {title ? (
        <h4 className="mb-3 text-sm font-semibold text-white/90">{title}</h4>
      ) : null}
      {children}
    </div>
  )
}
