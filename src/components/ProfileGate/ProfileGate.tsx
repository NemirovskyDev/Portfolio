import { PROFILES, type Profile } from '../../lib/profiles'
import { t } from '../../lib/i18n'
import { useAppState } from '../../state/AppState'
import { covers } from '../../data/projects'
import { LangToggle } from '../LangToggle'
import { OrbitBackdrop } from './OrbitBackdrop'
import './ProfileGate.css'

export function ProfileGate({ onChoose }: { onChoose: (p: Profile) => void }) {
  const { lang } = useAppState()
  return (
    <main className="gate">
      <OrbitBackdrop covers={covers} />
      <div className="gate-lang">
        <LangToggle />
      </div>
      <h1>{t('gate.title', lang)}</h1>
      <p className="gate-hint">{t('gate.hint', lang)}</p>
      <ul className="gate-profiles">
        {PROFILES.map((p) => (
          <li key={p}>
            <button type="button" className="gate-profile" onClick={() => onChoose(p)}>
              <span className="gate-avatar" aria-hidden="true">
                {t(`profile.${p}`, lang).charAt(0)}
              </span>
              <span className="gate-name">{t(`profile.${p}`, lang)}</span>
              <span className="gate-desc">{t(`profile.${p}.desc`, lang)}</span>
            </button>
          </li>
        ))}
      </ul>
    </main>
  )
}
