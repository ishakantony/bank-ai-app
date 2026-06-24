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
    <div className="mx-auto flex h-dvh w-full flex-col px-4">
      {header ? <div className="shrink-0">{header}</div> : null}

      <main className="flex flex-1 flex-col overflow-y-auto">{children}</main>

      <div className="shrink-0 pt-2">
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
    <div className="relative mx-auto h-dvh w-full">
      <main
        className="h-full overflow-y-auto px-4"
        style={{ scrollPaddingTop: pad.top, scrollPaddingBottom: pad.bottom }}
      >
        <div style={{ paddingTop: pad.top, paddingBottom: pad.bottom }}>
          {children}
        </div>
      </main>

      {header ? (
        <div
          ref={topRef}
          className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-ink-deep/70 via-ink-deep/40 to-transparent px-4 pb-6 backdrop-blur-md [mask-image:linear-gradient(to_bottom,black_60%,transparent)]"
        >
          <div className="pointer-events-auto">{header}</div>
        </div>
      ) : null}

      <div
        ref={bottomRef}
        className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-deep/80 via-ink-deep/50 to-transparent px-4 pt-8 backdrop-blur-md [mask-image:linear-gradient(to_top,black_70%,transparent)]"
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
  )
}
