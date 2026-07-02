import { useNavigate } from 'react-router-dom'
import { Bell, MessageSquareText, LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '../../store/authStore'
import { getGreeting } from '../../utils/format'

export function DashboardHeader({ name }: { name: string }) {
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)
  const { label, emoji } = getGreeting()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
    toast.success('Signed out.')
  }

  return (
    <header className="flex items-start justify-between pt-2">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">
          {label} {emoji}
        </h1>
        <p className="mt-0.5 text-sm text-ink-soft">Hi, {name}</p>
      </div>

      <div className="flex items-center gap-2">
        <IconButton label="Notifications" onClick={() => toast('No new alerts.')}>
          <Bell className="size-[18px]" strokeWidth={2} />
        </IconButton>
        <IconButton
          label="Messages"
          dot
          onClick={() => toast('Bank AI chat is coming soon.')}
        >
          <MessageSquareText className="size-[18px]" strokeWidth={2} />
        </IconButton>
        <IconButton label="Sign out" onClick={handleLogout}>
          <LogOut className="size-[18px]" strokeWidth={2} />
        </IconButton>
      </div>
    </header>
  )
}

function IconButton({
  children,
  label,
  dot,
  onClick,
}: {
  children: React.ReactNode
  label: string
  dot?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="glass relative grid size-10 place-items-center rounded-full text-ink transition hover:text-brand-1 active:scale-95"
    >
      {children}
      {dot ? (
        <span className="absolute right-2 top-2 size-2 rounded-full bg-tone-negative ring-2 ring-white" />
      ) : null}
    </button>
  )
}
