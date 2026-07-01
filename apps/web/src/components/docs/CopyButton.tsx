import { useEffect, useRef, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { toast } from 'sonner'

interface CopyButtonProps {
  /** Text written to the clipboard on click. */
  value: string
  /** Accessible label / tooltip; defaults to "Copy". */
  label?: string
}

/**
 * A small icon-and-label copy button used across the docs pages. Shows a
 * transient check on success and a toast if the clipboard write fails. Mirrors
 * the copy affordance in `MessageActions`.
 */
export function CopyButton({ value, label = 'Copy' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), 1500)
    } catch {
      toast('Couldn’t copy to clipboard')
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? 'Copied' : label}
      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-white/70 transition hover:border-white/25 hover:bg-white/10 hover:text-white/90"
    >
      {copied ? (
        <Check className="size-3.5 text-tone-positive" />
      ) : (
        <Copy className="size-3.5" />
      )}
      {copied ? 'Copied' : label}
    </button>
  )
}
