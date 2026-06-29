import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { ChatInput } from './ChatInput'
import { Footer } from './Footer'

interface AppShellProps {
  /** Optional top chrome (e.g. the chat header). Home has none. */
  header?: ReactNode
  children: ReactNode
  value: string
  onChange: (value: string) => void
  onSubmit: (value: string) => void
  /** Locks the chat input (e.g. while a reply is streaming). */
  inputDisabled?: boolean
  /**
   * Float the chrome over a full-height scroll area instead of pinning it in
   * normal flow. Used by the chat screen so messages scroll behind the
   * translucent top/bottom bars; content is padded to clear them.
   */
  overlay?: boolean
}

/**
 * The phone-width column shared by every screen: optional header, a scrollable
 * content area, and the chat input + footer pinned to the bottom.
 */
export function AppShell({
  header,
  children,
  value,
  onChange,
  onSubmit,
  inputDisabled,
  overlay,
}: AppShellProps) {
  if (overlay) {
    return (
      <OverlayShell
        header={header}
        value={value}
        onChange={onChange}
        onSubmit={onSubmit}
        inputDisabled={inputDisabled}
      >
        {children}
      </OverlayShell>
    )
  }

  return (
    // The outer column is full-width so the scroll area's scrollbar lands at
    // the browser's far-right edge; the chrome inside is centered to a
    // phone-width column.
    <div className="flex h-dvh w-full flex-col">
      {header ? (
        <div className={`shrink-0 pt-[env(safe-area-inset-top)] ${PHONE_COL}`}>
          {header}
        </div>
      ) : null}

      {/* When there's no header, the scroll area runs full-bleed to the top
          edge so content can scroll up behind the notch; the inset is applied
          as scrollable padding so the resting position still clears it. */}
      <main
        className={`flex flex-1 flex-col overflow-y-auto${header ? '' : ' pt-[env(safe-area-inset-top)]'}`}
      >
        <div className={`flex flex-1 flex-col ${PHONE_COL}`}>{children}</div>
      </main>

      <div
        className={`shrink-0 pt-2 pb-[env(safe-area-inset-bottom)] ${PHONE_COL}`}
      >
        <ChatInput
          value={value}
          onChange={onChange}
          onSubmit={onSubmit}
          disabled={inputDisabled}
        />
        <Footer />
      </div>
    </div>
  )
}

/**
 * The centered phone-width column the app chrome lives in. The scroll
 * containers stay full-width (so their scrollbar sits at the browser edge);
 * everything visible is constrained to this width and centered.
 */
const PHONE_COL = 'mx-auto w-full max-w-md px-4'

/**
 * Full-height scroll area with the header and chat input + footer floating on
 * top as blurred, fading bars. The scroll content is padded by the measured
 * height of each bar (the input auto-grows) so the first/last message clears
 * the chrome, and the same values feed `scroll-padding` so programmatic
 * scroll-to-bottom lands above the input rather than behind it.
 */
function OverlayShell({
  header,
  children,
  value,
  onChange,
  onSubmit,
  inputDisabled,
}: Omit<AppShellProps, 'overlay'>) {
  const topRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const [pad, setPad] = useState({ top: 0, bottom: 0 })

  useLayoutEffect(() => {
    const measure = () =>
      setPad({
        top: topRef.current?.offsetHeight ?? 0,
        bottom: bottomRef.current?.offsetHeight ?? 0,
      })
    measure()

    const observer = new ResizeObserver(measure)
    if (topRef.current) observer.observe(topRef.current)
    if (bottomRef.current) observer.observe(bottomRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    // Full-width so the scroll area's scrollbar reaches the browser's far-right
    // edge; the scroll content and the floating bars are each centered to the
    // phone-width column.
    <div className="relative h-dvh w-full">
      <main
        className="h-full overflow-y-auto"
        style={{ scrollPaddingTop: pad.top, scrollPaddingBottom: pad.bottom }}
      >
        <div
          className={PHONE_COL}
          style={{ paddingTop: pad.top, paddingBottom: pad.bottom }}
        >
          {children}
        </div>
      </main>

      {header ? (
        <div
          ref={topRef}
          className="pointer-events-none absolute inset-x-0 top-0"
        >
          <div
            className={`${PHONE_COL} bg-gradient-to-b from-ink-deep/70 via-ink-deep/40 to-transparent pb-6 pt-[env(safe-area-inset-top)] backdrop-blur-md [mask-image:linear-gradient(to_bottom,black_60%,transparent)]`}
          >
            <div className="pointer-events-auto">{header}</div>
          </div>
        </div>
      ) : null}

      <div
        ref={bottomRef}
        className="pointer-events-none absolute inset-x-0 bottom-0"
      >
        <div
          className={`${PHONE_COL} bg-gradient-to-t from-ink-deep/80 via-ink-deep/50 to-transparent pb-[env(safe-area-inset-bottom)] pt-8 backdrop-blur-md [mask-image:linear-gradient(to_top,black_70%,transparent)]`}
        >
          <div className="pointer-events-auto">
            <ChatInput
              value={value}
              onChange={onChange}
              onSubmit={onSubmit}
              disabled={inputDisabled}
            />
            <Footer />
          </div>
        </div>
      </div>
    </div>
  )
}
