import type { ReactNode } from 'react'
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
}: AppShellProps) {
  return (
    <div className="mx-auto flex h-dvh w-full max-w-[26rem] flex-col px-4">
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
