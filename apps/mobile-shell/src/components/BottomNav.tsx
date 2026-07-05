import { useLayoutEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
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
 *
 * The active tab is marked by a raised glass "pill" that slides between tabs.
 * Its position/width are measured off the live DOM (ResizeObserver, same
 * pattern as apps/web AppShell) so it stays aligned across gaps, padding,
 * varying label widths, and window resizes.
 */
export function BottomNav() {
  const { pathname } = useLocation()

  const activeIndex = (() => {
    const i = ITEMS.findIndex(({ to }) =>
      to === '/'
        ? pathname === '/'
        : pathname === to || pathname.startsWith(to + '/'),
    )
    return i === -1 ? 0 : i
  })()

  const navRef = useRef<HTMLElement>(null)
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([])
  const [pill, setPill] = useState({ left: 0, width: 0 })

  useLayoutEffect(() => {
    const measure = () => {
      const el = itemRefs.current[activeIndex]
      if (!el) return
      setPill({ left: el.offsetLeft, width: el.offsetWidth })
    }
    measure()

    const nav = navRef.current
    if (!nav) return
    const observer = new ResizeObserver(measure)
    observer.observe(nav)
    return () => observer.disconnect()
  }, [activeIndex])

  return (
    <nav
      ref={navRef}
      className="glass relative mx-auto flex w-full max-w-md items-stretch justify-between gap-1 rounded-[2.25rem] px-2 py-2"
    >
      {pill.width > 0 && (
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/2 rounded-full motion-safe:transition-[transform,width] motion-safe:duration-300 motion-safe:ease-out"
          style={{
            transform: `translateX(${pill.left}px) translateY(-50%)`,
            width: `${pill.width}px`,
            height: 'calc(100% - 0.5rem)',
            background: 'color(display-p3 0.929 0.929 0.929)',
            mixBlendMode: 'plus-darker',
          }}
        />
      )}
      {ITEMS.map(({ to, label, icon: Icon }, index) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          ref={(el) => {
            itemRefs.current[index] = el
          }}
          className="group relative z-10 flex flex-1 flex-col items-center gap-0.5 rounded-2xl px-1 py-1.5 text-[9px] leading-tight transition"
        >
          {({ isActive }) => (
            <>
              <span
                className={`grid size-9 place-items-center transition ${
                  isActive
                    ? 'text-brand-1'
                    : 'text-ink-soft group-hover:text-brand-1'
                }`}
              >
                <Icon
                  className="size-[26px]"
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
