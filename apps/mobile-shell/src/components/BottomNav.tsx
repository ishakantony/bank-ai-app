import { NavLink } from 'react-router-dom'
import {
  Home,
  ArrowLeftRight,
  LineChart,
  Compass,
  LayoutGrid,
  type LucideIcon,
} from 'lucide-react'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

const ITEMS: NavItem[] = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/payments', label: 'Payments', icon: ArrowLeftRight },
  { to: '/invest', label: 'Invest & Insure', icon: LineChart },
  { to: '/discover', label: 'Discover', icon: Compass },
  { to: '/services', label: 'Services', icon: LayoutGrid },
]

/**
 * The floating glass tab bar. Home is the only fully-built screen; the rest
 * route to a shared placeholder so navigation is real and guarded.
 */
export function BottomNav() {
  return (
    <nav className="glass mx-auto flex w-full max-w-md items-stretch justify-between gap-1 rounded-[1.75rem] px-2 py-2">
      {ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className="group flex flex-1 flex-col items-center gap-1 rounded-2xl px-1 py-1.5 text-[10px] leading-tight transition"
        >
          {({ isActive }) => (
            <>
              <span
                className={`grid size-8 place-items-center transition ${
                  isActive
                    ? 'text-brand-1'
                    : 'text-ink-soft group-hover:text-brand-1'
                }`}
              >
                <Icon
                  className="size-[20px]"
                  strokeWidth={isActive ? 2.4 : 2}
                  fill={isActive ? 'currentColor' : 'none'}
                  fillOpacity={isActive ? 0.14 : 0}
                />
              </span>
              <span
                className={`text-center ${
                  isActive
                    ? 'font-semibold text-brand-1'
                    : 'font-medium text-ink-soft'
                }`}
              >
                {label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
