import { ArrowLeftRight, Send, Users, Gauge } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { WelcomeProps } from './types'
import { QuickAction } from './QuickAction'

/** Transfer Money — centered "send" hero over a faux balance card. */
export function TransferWelcome({ onSend }: WelcomeProps) {
  const { t } = useTranslation()
  return (
    <div className="animate-float-in flex flex-col items-center gap-6 py-8 text-center">
      <span className="grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-accent-1/30 to-accent-2/30 text-white ring-1 ring-white/15">
        <ArrowLeftRight className="size-7" strokeWidth={1.75} />
      </span>

      <div>
        <h2 className="text-2xl font-semibold text-white">{t('welcomeScreens.transfer.heading')}</h2>
        <p className="mt-1.5 text-sm text-white/55">
          {t('welcomeScreens.transfer.subtitle')}
        </p>
      </div>

      <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-left backdrop-blur-md">
        <span className="text-xs uppercase tracking-wider text-white/40">
          {t('welcomeScreens.transfer.availableBalance')}
        </span>
        <p className="mt-1 text-3xl font-semibold text-white">RM4,820.65</p>
        <p className="mt-0.5 text-xs text-white/45">{t('welcomeScreens.transfer.account')}</p>
      </div>

      <div className="flex flex-wrap justify-center gap-2.5">
        <QuickAction
          label={t('welcomeScreens.transfer.sendToContact')}
          icon={Send}
          onClick={() => onSend(t('welcomeScreens.transfer.sendToContactSend'))}
        />
        <QuickAction
          label={t('welcomeScreens.transfer.payNewPayee')}
          icon={Users}
          onClick={() => onSend(t('welcomeScreens.transfer.payNewPayeeSend'))}
        />
        <QuickAction
          label={t('welcomeScreens.transfer.checkLimits')}
          icon={Gauge}
          onClick={() => onSend(t('welcomeScreens.transfer.checkLimitsSend'))}
        />
      </div>
    </div>
  )
}
