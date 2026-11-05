import { useMemo, useRef } from 'react'
import skillsSeed from '../../data/skills.json'
import { gsap, useGSAP } from '../../lib/gsap'
import { t } from '../../lib/i18n'
import { parseSkills } from '../../lib/skills'
import { useAppState } from '../../state/AppState'
import './About.css'

/** Skill groups, validated once at load: a typo in skills.json fails the build instead of showing an empty group. */
const GROUPS = parseSkills(skillsSeed)

type Props = {
  /** true pins the section while the scroll reveals each group; false shows everything at once. */
  animated: boolean
}

export function About({ animated }: Props) {
  const { lang } = useAppState()
  const root = useRef<HTMLElement>(null)
  const groups = useMemo(() => GROUPS, [])

  // Pin and scrub: the section stays on screen while the scroll walks through the intro, then each group in turn.
  useGSAP(
    () => {
      if (!animated) return
      const mm = gsap.matchMedia()
      const calm = '(prefers-reduced-motion: no-preference)'
      // Pin only where the whole section fits on one screen; a pinned block taller than the window would be cut off.
      mm.add(`${calm} and (min-width: 861px) and (min-height: 620px)`, () => {
        const tl = gsap.timeline({
          defaults: { ease: 'power2.out' },
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: () => `+=${window.innerHeight * (0.6 + groups.length * 0.55)}`,
            pin: true,
            scrub: 0.6,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        })
        tl.from('.about-head > *', { opacity: 0, y: 40, stagger: 0.25, duration: 1 })
        groups.forEach((_, i) => {
          tl.from(`.skill-group[data-i="${i}"]`, { opacity: 0, y: 48, duration: 1 })
          tl.from(`.skill-group[data-i="${i}"] li`, { opacity: 0, x: -14, stagger: 0.08, duration: 0.6 }, '<0.35')
        })
      })
      // Small or short screens: no pin, each part rises once as it enters.
      mm.add(`${calm} and (max-width: 860px), ${calm} and (max-height: 619px)`, () => {
        gsap.from('.about-head > *, .skill-group', {
          opacity: 0,
          y: 32,
          stagger: 0.1,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: { trigger: root.current, start: 'top 75%', once: true },
        })
      })
    },
    { scope: root, dependencies: [animated, lang, groups] },
  )

  return (
    <section ref={root} id="sobre" className="about" aria-labelledby="about-title">
      <div className="about-inner">
        <div className="about-head">
          <h2 id="about-title">{t('about.title', lang)}</h2>
          <p>{t('about.text', lang)}</p>
        </div>
        <div className="about-skills" role="group" aria-label={t('about.skills', lang)}>
          {groups.map((g, i) => (
            <div key={g.id} className="skill-group" data-i={i}>
              <h3>{g.grupo[lang]}</h3>
              <ul role="list">
                {g.itens.map((it) => (
                  <li key={it.pt}>{it[lang]}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
