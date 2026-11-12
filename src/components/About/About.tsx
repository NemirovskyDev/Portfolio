import { useEffect, useRef, useState } from 'react'
import { projects } from '../../data/projects'
import { gsap, useGSAP } from '../../lib/gsap'
import { t } from '../../lib/i18n'
import { SKILL_GROUPS as groups } from '../../lib/skills'
import { useAppState } from '../../state/AppState'
import './About.css'

type Props = {
  /** true pins the section while the scroll reveals each group; false shows everything at once. */
  animated: boolean
  /** Opens a project window (the same handler the rest of the page uses). */
  onOpenProject: (id: string) => void
  /** A request from outside (the command palette) to open and focus one skill; `n` grows on every request so the same skill can be asked twice. */
  focusSkill?: { id: string; n: number } | null
}

const itemCount = groups.reduce((n, g) => n + g.itens.length, 0)
/** Screen heights of scroll given to each skill while the section is pinned. */
const ITEM_SCROLL = 0.14

export function About({ animated, onOpenProject, focusSkill }: Props) {
  const { lang } = useAppState()
  const root = useRef<HTMLElement>(null)
  const triggers = useRef(new Map<string, HTMLButtonElement>())
  const [openId, setOpenId] = useState<string | null>(null)

  const focusId = focusSkill?.id
  const focusN = focusSkill?.n
  useEffect(() => {
    if (!focusId) return
    const btn = triggers.current.get(focusId)
    if (!btn) return
    setOpenId(focusId)
    btn.scrollIntoView?.({ block: 'center' }) // optional call: jsdom has no scrollIntoView
    btn.focus()
  }, [focusId, focusN])

  // Esc closes and hands focus back to the item; a press outside only closes (the click keeps the focus it chose).
  useEffect(() => {
    if (!openId) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setOpenId(null)
      triggers.current.get(openId)?.focus()
    }
    const onDown = (e: PointerEvent) => {
      if (!(e.target as Element | null)?.closest?.(`[data-skill="${openId}"]`)) setOpenId(null)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onDown)
    }
  }, [openId])

  const openProject = (skillId: string, projectId: string) => {
    // focus goes back to the item first, so the project window later restores focus to something that still exists
    setOpenId(null)
    triggers.current.get(skillId)?.focus()
    onOpenProject(projectId)
  }

  // Pin and scrub: the section stays on screen while the scroll walks through the intro, then each skill in turn.
  useGSAP(
    () => {
      if (!animated) return
      const mm = gsap.matchMedia()
      const calm = '(prefers-reduced-motion: no-preference)'
      // Pinned at any window height. When the content is taller than the window, it slides up while the groups appear,
      // so nothing is cut off and the scroll still walks through the whole section.
      mm.add(`${calm} and (min-width: 861px)`, () => {
        const el = root.current
        el?.classList.add('about--pinned')
        const tl = gsap.timeline({
          defaults: { ease: 'power2.out' },
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            // a stretch of scroll for every single item, so each topic gets its own moment
            end: () => `+=${window.innerHeight * (0.6 + itemCount * ITEM_SCROLL)}`,
            pin: true,
            scrub: 0.6,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        })
        tl.from('.about-head > *', { opacity: 0, y: 40, stagger: 0.25, duration: 1 })
        // One topic at a time: each group title, then its items one after the other, overlapping just enough to feel continuous.
        groups.forEach((_, i) => {
          const group = `.skill-group[data-i="${i}"]`
          tl.from(`${group} h3`, { opacity: 0, y: 12, duration: 0.5 }, '>-0.2')
          el?.querySelectorAll<HTMLElement>(`${group} li`).forEach((li) => {
            tl.from(li, { opacity: 0, x: -16, duration: 1 }, '>-0.55')
          })
        })
        const inner = el?.querySelector<HTMLElement>('.about-inner')
        if (inner) {
          // a function value, so it is measured again on every refresh (resize, language change)
          const overflow = () => Math.max(0, inner.offsetHeight - window.innerHeight)
          const total = tl.duration()
          tl.to(inner, { y: () => -overflow(), ease: 'none', duration: total * 0.85 }, total * 0.15)
        }
        return () => el?.classList.remove('about--pinned')
      })
      // Narrow screens: no pin, each part rises once as it enters.
      mm.add(`${calm} and (max-width: 860px)`, () => {
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
    // the language swaps text in place: rebuilding the pin on a toggle would drop its spacer and strand the other triggers
    { scope: root, dependencies: [animated] },
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
                {g.itens.map((it) => {
                  const open = openId === it.id
                  const panelId = `skill-panel-${it.id}`
                  return (
                    <li key={it.id} data-skill={it.id}>
                      <button
                        type="button"
                        ref={(el) => {
                          if (el) triggers.current.set(it.id, el)
                          else triggers.current.delete(it.id)
                        }}
                        className="skill-btn"
                        aria-expanded={open}
                        aria-controls={panelId}
                        onClick={() => setOpenId(open ? null : it.id)}
                      >
                        {it[lang]}
                      </button>
                      {open && (
                        // absolute: the pinned section was measured once, so opening this must not change its height
                        <div id={panelId} className="skill-used" role="group" aria-label={t('about.usedIn', lang)}>
                          <span className="skill-used-label">{t('about.usedIn', lang)}:</span>
                          {it.projetos.map((pid) => {
                            const project = projects.find((p) => p.id === pid)
                            return project ? (
                              <button key={pid} type="button" className="skill-chip" onClick={() => openProject(it.id, pid)}>
                                {project.titulo[lang]}
                              </button>
                            ) : null
                          })}
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
