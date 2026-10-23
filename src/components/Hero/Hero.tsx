import { useState } from 'react'
import type { Project } from '../../lib/types'
import { asset } from '../../lib/assets'
import { t } from '../../lib/i18n'
import { useAppState } from '../../state/AppState'
import './Hero.css'

type Props = { project: Project; onOpen: (id: string) => void }

export function Hero({ project, onOpen }: Props) {
  const { lang } = useAppState()
  const [noImage, setNoImage] = useState(false)
  return (
    <section className="hero" aria-label={t('hero.featured', lang)}>
      {!noImage && <img className="hero-bg" src={asset(project.fundo)} alt="" onError={() => setNoImage(true)} />}
      <div className="hero-copy">
        <p className="hero-kicker">{t('hero.featured', lang)}</p>
        <h1>{project.titulo[lang]}</h1>
        <p className="hero-text">{project.resumo[lang]}</p>
        <button type="button" className="btn-primary" onClick={() => onOpen(project.id)}>
          {t('hero.details', lang)}
        </button>
      </div>
    </section>
  )
}
