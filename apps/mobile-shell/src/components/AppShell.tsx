import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'

/**
 * The phone-width column shared by the authenticated screens: a full-height
 * scroll area with the tab bar floating over its bottom edge. The scroll
 * content is padded so the last row clears the (absolutely-positioned) nav.
 *
 * Mounted once as a layout route (see App.tsx) so it — and BottomNav — persist
 * across tab navigations; only the <Outlet/> content swaps. This keeps the
 * active-pill slide animation alive when moving to/from Home.
 */
export function AppShell() {
  return (
    // Full-width so the scrollbar sits at the browser edge; the visible content
    // and the floating nav are each centered to the phone-width column.
    <div className="relative h-dvh w-full">
      <main className="h-full overflow-y-auto">
        <div className="mx-auto w-full max-w-md px-4 pt-[max(env(safe-area-inset-top),0.75rem)] pb-32">
          <Outlet />
        </div>
      </main>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-6 [mask-image:linear-gradient(to_top,black_78%,transparent)]">
        <div className="pointer-events-auto">
          <BottomNav />
        </div>
      </div>
    </div>
  )
}
