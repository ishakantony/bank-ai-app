import { useTranslation } from 'react-i18next'

export function Footer() {
  const { t } = useTranslation()
  return (
    <footer className="pb-4 pt-3 text-center text-xs text-white/40">
      {t('footer.disclaimer')}
    </footer>
  )
}
