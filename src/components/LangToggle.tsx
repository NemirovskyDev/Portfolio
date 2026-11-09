import { t } from '../lib/i18n'
import { useAppState } from '../state/AppState'
import { RollText } from './RollText'
import './LangToggle.css'

export function LangToggle() {
  const { lang, setLang } = useAppState()
  return (
    <button
      type="button"
      className="lang-toggle roll-host"
      data-magnetic="0.3"
      aria-label={t('lang.switch', lang)}
      onClick={() => setLang(lang === 'pt' ? 'en' : 'pt')}
    >
      <RollText>{t('lang.short', lang)}</RollText>
    </button>
  )
}
