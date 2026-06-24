import type { LucideIcon } from 'lucide-react'

interface QuickActionProps {
  label: string
  icon?: LucideIcon
  onClick: () => void
}

/** A tappable suggestion chip that kicks off the conversation via onSend. */
export function QuickAction({ label, icon: Icon, onClick }: QuickActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-sm text-white/85 backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.09] hover:shadow-[0_8px_30px_-12px_rgba(150,120,255,0.5)] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-1/70"
    >
      {Icon ? (
        <Icon
          className="size-4 text-accent-3 transition-transform duration-300 group-hover:scale-110"
          strokeWidth={2}
        />
      ) : null}
      {label}
    </button>
  )
}
