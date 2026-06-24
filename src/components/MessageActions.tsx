import { useEffect, useRef, useState } from 'react'
import { Check, Copy, ThumbsDown, ThumbsUp } from 'lucide-react'
import { toast } from 'sonner'

type Feedback = 'up' | 'down' | null

interface MessageActionsProps {
  /** Raw markdown source of the assistant reply, used for copy. */
  content: string
}

/**
 * Row of icon buttons shown beneath a finished assistant message: copy the
 * reply, and rate it up/down. Feedback is local UI state (mutually exclusive,
 * click-again to clear) and surfaces a toast on selection.
 */
export function MessageActions({ content }: MessageActionsProps) {
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [copied, setCopied] = useState(false)
  const copiedTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(copiedTimer.current), [])

  const rate = (value: Exclude<Feedback, null>) => {
    const next = feedback === value ? null : value
    if (next) toast('Thanks for your feedback')
    setFeedback(next)
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      clearTimeout(copiedTimer.current)
      copiedTimer.current = setTimeout(() => setCopied(false), 1500)
    } catch {
      toast('Couldn’t copy to clipboard')
    }
  }

  return (
    <div className="mt-1.5 flex items-center gap-1 text-white/50">
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? 'Copied' : 'Copy message'}
        className="rounded-lg p-1.5 transition hover:bg-white/10 hover:text-white/80"
      >
        {copied ? (
          <Check className="size-4 text-tone-positive" />
        ) : (
          <Copy className="size-4" />
        )}
      </button>
      <button
        type="button"
        onClick={() => rate('up')}
        aria-label="Like message"
        aria-pressed={feedback === 'up'}
        className={`rounded-lg p-1.5 transition hover:bg-white/10 hover:text-white/80 ${
          feedback === 'up' ? 'text-accent-3' : ''
        }`}
      >
        <ThumbsUp className="size-4" fill={feedback === 'up' ? 'currentColor' : 'none'} />
      </button>
      <button
        type="button"
        onClick={() => rate('down')}
        aria-label="Dislike message"
        aria-pressed={feedback === 'down'}
        className={`rounded-lg p-1.5 transition hover:bg-white/10 hover:text-white/80 ${
          feedback === 'down' ? 'text-tone-negative' : ''
        }`}
      >
        <ThumbsDown className="size-4" fill={feedback === 'down' ? 'currentColor' : 'none'} />
      </button>
    </div>
  )
}
