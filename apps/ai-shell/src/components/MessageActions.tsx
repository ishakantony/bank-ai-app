import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, Copy, RefreshCw, Square, ThumbsDown, ThumbsUp, Volume2 } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { useSpeech } from '../hooks/useSpeech'
import { speechText } from '../hooks/speechText'
import { copyText } from '../hooks/copyText'
import { expandBlocksToText } from './blocks/blockText'
import { useChatStore } from '../store/chatStore'
import type { ThreadId } from '@bank-poc/shared'

type Feedback = 'up' | 'down' | null

/** i18n language → BCP-47 tag so speech synthesis picks the right voice. */
const SPEECH_LANG: Record<string, string> = {
  en: 'en-US',
  ms: 'ms-MY',
  zh: 'zh-CN',
}

interface MessageActionsProps {
  /** Raw markdown source of the assistant reply, used for copy. */
  content: string
  /** Thread this reply belongs to, for regenerating. */
  threadId: ThreadId
  /** Id of this assistant message, for regenerating. */
  messageId: string
  /** Only the last reply can be regenerated (it truncates the thread). */
  canRegenerate: boolean
}

/**
 * Row of icon buttons shown beneath a finished assistant message: copy the
 * reply, and rate it up/down. Feedback is local UI state (mutually exclusive,
 * click-again to clear) and surfaces a toast on selection.
 */
export function MessageActions({
  content,
  threadId,
  messageId,
  canRegenerate,
}: MessageActionsProps) {
  const { t, i18n } = useTranslation()
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [copied, setCopied] = useState(false)
  const copiedTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const regenerate = useChatStore((s) => s.regenerate)
  const pending = useChatStore((s) => s.pending)
  const { speaking, toggle: toggleSpeech, supported: canSpeak } = useSpeech()
  const spoken = useMemo(() => speechText(content), [content])
  const speechLang = SPEECH_LANG[i18n.language.split('-')[0]] ?? i18n.language

  useEffect(() => () => clearTimeout(copiedTimer.current), [])

  const rate = (value: Exclude<Feedback, null>) => {
    const next = feedback === value ? null : value
    if (next) toast(t('messageActions.feedbackThanks'))
    setFeedback(next)
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(copyText(await expandBlocksToText(content)))
      setCopied(true)
      clearTimeout(copiedTimer.current)
      copiedTimer.current = setTimeout(() => setCopied(false), 1500)
    } catch {
      toast(t('messageActions.copyFailed'))
    }
  }

  return (
    <div className="mt-1.5 flex items-center gap-1 text-white/50">
      {canRegenerate ? (
        <button
          type="button"
          onClick={() => regenerate(threadId, messageId)}
          disabled={pending != null}
          aria-label={t('messageActions.regenerate')}
          className="rounded-lg p-1.5 transition hover:bg-white/10 hover:text-white/80 disabled:opacity-40"
        >
          <RefreshCw className="size-4" />
        </button>
      ) : null}
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? t('messageActions.copied') : t('messageActions.copy')}
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
        aria-label={t('messageActions.like')}
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
        aria-label={t('messageActions.dislike')}
        aria-pressed={feedback === 'down'}
        className={`rounded-lg p-1.5 transition hover:bg-white/10 hover:text-white/80 ${
          feedback === 'down' ? 'text-tone-negative' : ''
        }`}
      >
        <ThumbsDown className="size-4" fill={feedback === 'down' ? 'currentColor' : 'none'} />
      </button>
      {canSpeak && spoken ? (
        <button
          type="button"
          onClick={() => toggleSpeech(spoken, speechLang)}
          aria-label={speaking ? t('messageActions.stopReading') : t('messageActions.readAloud')}
          aria-pressed={speaking}
          className={`rounded-lg p-1.5 transition hover:bg-white/10 hover:text-white/80 ${
            speaking ? 'text-accent-3' : ''
          }`}
        >
          {speaking ? (
            <Square className="size-4" fill="currentColor" />
          ) : (
            <Volume2 className="size-4" />
          )}
        </button>
      ) : null}
    </div>
  )
}
