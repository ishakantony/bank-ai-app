import { ShieldCheck, ScanEye, Lock, AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { WelcomeProps } from './types'
import { QuickAction } from './QuickAction'

/** Fraud & Security — a reassuring "protected" status banner, then actions. */
export function SecurityWelcome({ onSend }: WelcomeProps) {
  const { t } = useTranslation()
  return (
    <div className="animate-float-in flex flex-col items-center gap-6 py-8 text-center">
      <span className="relative grid size-20 place-items-center rounded-full bg-gradient-to-br from-accent-3/25 to-accent-1/25 text-white ring-1 ring-white/15">
        <span className="absolute inset-0 animate-pulse rounded-full bg-accent-3/10 blur-md" />
        <ShieldCheck className="relative size-9" strokeWidth={1.5} />
      </span>

      <div>
        <h2 className="text-2xl font-semibold text-white">{t('welcomeScreens.security.heading')}</h2>
        <p className="mt-1.5 text-sm text-white/55">
          {t('welcomeScreens.security.subtitle')}
        </p>
      </div>

      <div className="flex w-full items-center gap-2 rounded-xl border border-accent-3/30 bg-accent-3/10 px-3.5 py-2.5 text-left text-sm text-white/80">
        <span className="size-2 shrink-0 rounded-full bg-accent-3" />
        {t('welcomeScreens.security.statusBanner')}
      </div>

      <div className="flex flex-col gap-2.5">
        <QuickAction
          label={t('welcomeScreens.security.review')}
          icon={ScanEye}
          onClick={() => onSend(t('welcomeScreens.security.reviewSend'))}
        />
        <QuickAction
          label={t('welcomeScreens.security.report')}
          icon={AlertTriangle}
          onClick={() => onSend(t('welcomeScreens.security.reportSend'))}
        />
        <QuickAction
          label={t('welcomeScreens.security.lock')}
          icon={Lock}
          onClick={() => onSend(t('welcomeScreens.security.lockSend'))}
        />
      </div>
    </div>
  )
}
