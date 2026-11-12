import { Fragment, useEffect, useRef, useState } from 'react'
import { projects } from '../../data/projects'
import { gsap, ScrollTrigger, useGSAP } from '../../lib/gsap'
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

/** Room kept free while pinned: the fixed top bar above, a little air below. The content is scaled to fit what is left. */
const SAFE_TOP = 80
const SAFE_BOTTOM = 24

/** Smallest scale the content may shrink to on a very short window; below this the text would stop being readable. */
const MIN_FIT = 0.55

/** Screen heights of scroll per unit of the timeline; one skill takes about a third of a unit, so roughly one wheel notch. */
const UNIT_SCROLL = 0.4

/**
 * Text split into words so the scroll can bring them in one by one. Done in React (not by rewriting the DOM), so a
 * language change simply renders new words. The spaces stay as plain text between the spans: the accessible name keeps them.
 */
function Words({ text }: { text: string }) {
  return (
    <>
      {text.split(' ').map((w, i) => (
        <Fragment key={`${i}-${w}`}>
          {i > 0 ? ' ' : null}
          <span className="w">{w}</span>
        </Fragment>
      ))}
    </>
  )
}

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

  // The pin lives as long as the layout does; the words in it are refilled when the language changes (see the effect below).
  const refill = useRef<(() => void) | null>(null)

  // The section starts empty and is written by the scroll: title, intro, then every group title and skill, word by word.
  useGSAP(
    () => {
      if (!animated) return
      const mm = gsap.matchMedia()
      const calm = '(prefers-reduced-motion: no-preference)'
      // Pinned at any window height, and the screen stays still while the scroll writes it: when the content is taller
      // than the window it is made smaller to fit (see fit), never slid up.
      mm.add(`${calm} and (min-width: 861px)`, () => {
        const el = root.current
        if (!el) return
        el.classList.add('about--pinned')
        const inner = el.querySelector<HTMLElement>('.about-inner')
        // Measured at full size, then scaled by CSS zoom (which re-wraps the text) so everything fits one screen.
        const fit = () => {
          if (!inner) return
          inner.style.zoom = '1'
          const room = window.innerHeight - SAFE_TOP - SAFE_BOTTOM
          inner.style.zoom = String(Math.min(1, Math.max(MIN_FIT, room / inner.offsetHeight)))
        }
        const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })

        const build = () => {
          tl.clear()
          fit() // the language changes the text, and with it the height
          // clear() keeps the inline styles of the previous tweens; a from() would read their opacity 0 as its end value
          gsap.set(el.querySelectorAll('.w, .skill-group li'), { clearProps: 'opacity,transform' })
          // each call brings a run of words in from the left, one after the other, starting just before the previous run ends
          const say = (targets: HTMLElement[], gap: number, at = '>-0.35') => {
            if (targets.length) tl.from(targets, { opacity: 0, x: -24, duration: 0.5, stagger: gap }, at)
          }
          const words = (selector: string, from: ParentNode = el) => gsap.utils.toArray<HTMLElement>(`${selector} .w`, from)
          say(words('.about-head h2'), 0.25)
          say(words('.about-head p'), 0.09)
          groups.forEach((_, i) => {
            const group = `.skill-group[data-i="${i}"]`
            say(words(`${group} h3`), 0.2)
            el.querySelectorAll<HTMLElement>(`${group} li`).forEach((li) => {
              // The item's own left bar must not show before its words: it comes in with them. It goes first so the next
              // item still chains from the end of the words (a position like '>' counts from the last tween added).
              tl.from(li, { opacity: 0, duration: 0.3 }, '>-0.35')
              say(gsap.utils.toArray<HTMLElement>('.w', li), 0.18, '<')
            })
          })
        }
        build()
        refill.current = build

        ScrollTrigger.create({
          animation: tl,
          trigger: el,
          start: 'top top',
          // the scroll is proportional to the timeline, so every word and every skill gets its own stretch
          end: () => `+=${tl.duration() * UNIT_SCROLL * window.innerHeight}`,
          pin: true,
          scrub: 0.5,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onRefreshInit: fit, // a resize changes the window height before the pin is measured again
        })
        return () => {
          refill.current = null
          if (inner) inner.style.zoom = ''
          el.classList.remove('about--pinned')
        }
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
    // Not [lang]: rebuilding the pin on a language change dropped its spacer and left the stage trigger out of place.
    { scope: root, dependencies: [animated] },
  )

  // A language change renders new word elements: refill the same timeline with them. Home measures the page right after.
  useEffect(() => {
    refill.current?.()
  }, [lang])

  return (
    <section ref={root} id="sobre" className="about" aria-labelledby="about-title">
      <div className="about-inner">
        <div className="about-head">
          <h2 id="about-title">
            <Words text={t('about.title', lang)} />
          </h2>
          <p>
            <Words text={t('about.text', lang)} />
          </p>
        </div>
        <div className="about-skills" role="group" aria-label={t('about.skills', lang)}>
          {groups.map((g, i) => (
            <div key={g.id} className="skill-group" data-i={i}>
              <h3>
                <Words text={g.grupo[lang]} />
              </h3>
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
                        <Words text={it[lang]} />
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
