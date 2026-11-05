import { Fragment, useRef } from 'react'
import { gsap, useGSAP } from '../../lib/gsap'
import { t } from '../../lib/i18n'
import type { FluidColors } from '../../lib/palette'
import { useSectionProgress } from '../../lib/useSectionProgress'
import { scrollToTarget } from '../../lib/useSmoothScroll'
import { useAppState } from '../../state/AppState'
import { FluidBackdrop } from '../Fluid/FluidBackdrop'
import './Hero.css'

type Props = { colors: FluidColors; projectCount: number; live: boolean }

const goTo = (id: string) => {
  const el = document.getElementById(id)
  if (el) scrollToTarget(el)
}

/** First screen: the name over a living gradient, one line about the focus, and the two paths a visitor takes. */
export function Hero({ colors, projectCount, live }: Props) {
  const { lang } = useAppState()
  const root = useRef<HTMLElement>(null)
  const progress = useSectionProgress(root)
  const words = t('site.name', lang).split(' ')

  // Entrance: each word of the name rises out of its line, then the rest settles in. Skipped with reduced motion.
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap
          .timeline({ defaults: { ease: 'power3.out' } })
          .from('.hero-word', { yPercent: 110, duration: 1, stagger: 0.12 })
          .from('.hero-reveal', { opacity: 0, y: 16, duration: 0.7, stagger: 0.1 }, '-=0.5')
      })
    },
    { scope: root, dependencies: [lang] },
  )

  return (
    <section ref={root} id="inicio" className="hero" aria-label={t('site.name', lang)}>
      <FluidBackdrop colors={colors} live={live} scroll={progress} />
      <div className="hero-body">
        <h1 className="hero-title" tabIndex={-1}>
          {words.map((w, i) => (
            // the plain-text space sits between the inline-block lines so the accessible name keeps it
            <Fragment key={`${i}-${w}`}>
              {i > 0 ? ' ' : null}
              <span className="hero-line">
                <span className="hero-word">{w}</span>
              </span>
            </Fragment>
          ))}
        </h1>
        <p className="hero-sub hero-reveal">{t('hero.line', lang)}</p>
        <div className="hero-actions hero-reveal">
          <button type="button" className="hero-cta" onClick={() => goTo('projetos')}>
            {t('hero.cta', lang)}
          </button>
          <button type="button" className="hero-ghost" onClick={() => goTo('contato')}>
            {t('hero.contact', lang)}
          </button>
        </div>
        <p className="hero-meta hero-reveal">
          <span>{t('hero.count', lang).replace('{n}', String(projectCount))}</span>
          <span className="hero-scroll">{t('hero.scroll', lang)}</span>
        </p>
      </div>
    </section>
  )
}
