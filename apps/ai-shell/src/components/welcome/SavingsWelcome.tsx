import { PiggyBank, Target, Repeat, TrendingUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { WelcomeProps } from './types'
import { QuickAction } from './QuickAction'

/** Savings & Goals — a goal-progress card up top, suggestions below. */
export function SavingsWelcome({ onSend }: WelcomeProps) {
  const { t } = useTranslation()
  const progress = 64

  return (
    <div className="animate-float-in flex flex-col gap-6 py-8">
      <div className="flex items-center gap-3">
        <span className="grid size-12 place-items-center rounded-xl bg-gradient-to-br from-accent-3/30 to-accent-1/30 text-white ring-1 ring-white/15">
          <PiggyBank className="size-6" strokeWidth={1.75} />
        </span>
        <div>
          <h2 className="text-xl font-semibold text-white">{t('welcomeScreens.savings.heading')}</h2>
          <p className="text-sm text-white/55">{t('welcomeScreens.savings.subtitle')}</p>
        </div>
      </div>

      {/* Goal progress card */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
        <div className="flex items-baseline justify-between">
          <span className="text-sm font-medium text-white">{t('welcomeScreens.savings.goalName')}</span>
          <span className="text-sm text-white/60">RM1,920 / RM3,000</span>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent-1 via-accent-2 to-accent-3"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-white/45">{t('welcomeScreens.savings.progress', { progress })}</p>
      </div>

      <div className="flex flex-wrap gap-2.5">
        <QuickAction
          label={t('welcomeScreens.savings.newGoal')}
          icon={Target}
          onClick={() => onSend(t('welcomeScreens.savings.newGoalSend'))}
        />
        <QuickAction
          label={t('welcomeScreens.savings.autoSave')}
          icon={Repeat}
          onClick={() => onSend(t('welcomeScreens.savings.autoSaveSend'))}
        />
        <QuickAction
          label={t('welcomeScreens.savings.project')}
          icon={TrendingUp}
          onClick={() => onSend(t('welcomeScreens.savings.projectSend'))}
        />
      </div>
    </div>
  )
}
