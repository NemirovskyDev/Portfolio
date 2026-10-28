import { t } from '../../lib/i18n'
import { useAppState } from '../../state/AppState'
import { About } from '../About/About'
import './Credits.css'

/** The closing chapter: who is behind the work, where to find them, and a way back to the start. */
export function Credits({ onTop }: { onTop: () => void }) {
  const { lang } = useAppState()
  return (
    <div className="credits">
      <About />
      <button type="button" className="credits-top" onClick={onTop}>
        {t('credits.top', lang)}
      </button>
    </div>
  )
}
