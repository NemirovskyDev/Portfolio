import { t } from '../lib/i18n'
import { useAppState } from '../state/AppState'
import './LangToggle.css'

export function LangToggle() {
  const { lang, setLang } = useAppState()
  return (
    <button
      type="button"
      className="lang-toggle"
      aria-label={t('lang.switch', lang)}
      onClick={() => setLang(lang === 'pt' ? 'en' : 'pt')}
    >
      {t('lang.short', lang)}
    </button>
  )
}
