import { TriangleAlert } from 'lucide-react'

/**
 * Subtle inline notice rendered in place of a block that couldn't be shown
 * (unknown name, unparseable JSON, failed validation, or a runtime throw). The
 * surrounding markdown prose still carries the underlying information.
 */
export function BlockFallback() {
  return (
    <div className="my-3 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/45">
      <TriangleAlert className="size-3.5 shrink-0 text-white/40" />
      This view couldn’t be displayed.
    </div>
  )
}
