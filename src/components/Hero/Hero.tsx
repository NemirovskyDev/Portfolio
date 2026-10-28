import { useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import type { Project } from '../../lib/types'
import { asset } from '../../lib/assets'
import { t } from '../../lib/i18n'
import { useReducedMotion } from '../../lib/useReducedMotion'
import { useAppState } from '../../state/AppState'
import './Hero.css'

type Props = { project: Project; onOpen: (id: string) => void }

export function Hero({ project, onOpen }: Props) {
  const { lang } = useAppState()
  const reduce = useReducedMotion()
  const [noImage, setNoImage] = useState(false)
  const ref = useRef<HTMLElement>(null)
  // Progress over the hero's own travel through the viewport; hooks stay unconditional, styles are gated below.
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 100])
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.04, 1.16])
  const bgRotateX = useTransform(scrollYProgress, [0, 1], [0, 6])
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -60])
  const copyOpacity = useTransform(scrollYProgress, [0.4, 0.9], [1, 0])
  return (
    <section ref={ref} className="hero" aria-label={t('hero.featured', lang)}>
      {!noImage && (
        <motion.div className="hero-bg-layer" style={reduce ? undefined : { y: bgY, scale: bgScale, rotateX: bgRotateX }}>
          <img className="hero-bg" src={asset(project.fundo)} alt="" onError={() => setNoImage(true)} />
        </motion.div>
      )}
      <motion.div className="hero-copy" style={reduce ? undefined : { y: copyY, opacity: copyOpacity }}>
        <p className="hero-kicker">{t('hero.featured', lang)}</p>
        <h1>{project.titulo[lang]}</h1>
        <p className="hero-text">{project.resumo[lang]}</p>
        <button type="button" className="btn-primary" onClick={() => onOpen(project.id)}>
          {t('hero.details', lang)}
        </button>
      </motion.div>
    </section>
  )
}
