import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import type { Project } from '../lib/types'
import { buildChapters } from '../lib/chapters'
import { t } from '../lib/i18n'
import { ScrollTrigger } from '../lib/gsap'
import { fluidColors, paletteFor } from '../lib/palette'
import { useCinemaMode } from '../lib/useCinemaMode'
import { useHashProject } from '../lib/useHashProject'
import { useMagnetic } from '../lib/useMagnetic'
import { scrollToTarget, useSmoothScroll } from '../lib/useSmoothScroll'
import { useAppState } from '../state/AppState'
import { About } from '../components/About/About'
import { CinemaStage } from '../components/Cinema/CinemaStage'
import { CommandPalette, type SectionId } from '../components/CommandPalette/CommandPalette'
import { useCommandShortcut } from '../components/CommandPalette/useCommandShortcut'
import { IndexPanel } from '../components/Cinema/IndexPanel'
import { StaticChapters } from '../components/Cinema/StaticChapters'
import { Contact } from '../components/Contact/Contact'
import { Hero } from '../components/Hero/Hero'
import { LangToggle } from '../components/LangToggle'
import { ProjectModal } from '../components/ProjectModal/ProjectModal'
import { RollText } from '../components/RollText'
import { SiteNav } from '../components/SiteNav/SiteNav'
import './Home.css'

type Props = { projects: Project[] }

export function Home({ projects }: Props) {
  const { lang } = useAppState()
  const chapters = useMemo(() => buildChapters(projects), [projects])
  const colors = useMemo(() => fluidColors(chapters.map((c) => c.id)), [chapters])
  const mode = useCinemaMode()
  const cinema = mode === 'cinema'
  const { project: open, open: openProject, close } = useHashProject(projects)
  useMagnetic() // one delegated listener; also covers the project window, which sits outside <main>
  const [indexOpen, setIndexOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [focusSkill, setFocusSkill] = useState<{ id: string; n: number } | null>(null)
  const skillTimer = useRef<number>(0)
  const main = useRef<HTMLElement>(null)
  // a window over the page hides everything behind it, so the 3D and the gradients stop drawing
  const covered = Boolean(open) || indexOpen || paletteOpen
  // The modal and the index own the wheel while open; Lenis would keep moving the page underneath.
  useSmoothScroll({ enabled: cinema, paused: covered })

  // Another language changes line breaks and section heights; every scroll trigger must measure the page again.
  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(id)
  }, [lang])

  // Sections meet on the colour of the chapter next to them, so the seams between sections are gradients, not edges.
  const seams = {
    '--seam-first': paletteFor(chapters[0]?.id ?? 'opening').ground,
    '--seam-last': paletteFor(chapters[chapters.length - 1]?.id ?? 'opening').ground,
  } as CSSProperties

  // Ctrl/Cmd+K, unless another window already owns the screen
  useCommandShortcut(
    useCallback(() => {
      if (!open && !indexOpen) setPaletteOpen(true)
    }, [open, indexOpen]),
  )
  useEffect(() => () => window.clearTimeout(skillTimer.current), [])

  const pickSection = (id: SectionId) => {
    const el = document.getElementById(id)
    if (el) scrollToTarget(el)
  }

  const pickSkill = (skillId: string) => {
    const about = document.getElementById('sobre')
    // With the pin, groups appear as the scroll advances: go to the end of the pin, where every group is revealed.
    const trigger = ScrollTrigger.getAll().find((tr) => tr.trigger === about)
    if (trigger && trigger.pin) scrollToTarget(Math.max(trigger.end - 2, 0))
    else if (about) scrollToTarget(about)
    window.clearTimeout(skillTimer.current)
    // let the glide finish before the item takes focus, so the focus jump does not fight the scroll
    skillTimer.current = window.setTimeout(() => setFocusSkill((prev) => ({ id: skillId, n: (prev?.n ?? 0) + 1 })), cinema ? 1100 : 0)
  }

  const toTop = () => {
    scrollToTarget(0)
    // focus lands on the page title so keyboard and screen reader users start again from the top
    main.current?.querySelector<HTMLElement>('.hero-title')?.focus({ preventScroll: true })
  }

  return (
    <>
      <header className="topbar">
        <button type="button" className="wordmark" aria-label={t('nav.home', lang)} onClick={toTop}>
          {t('site.fullName', lang)}
        </button>
        <div className="topbar-actions">
          <SiteNav />
          <button type="button" className="topbar-btn topbar-btn--icon" data-magnetic="0.3" aria-haspopup="dialog" aria-label={t('palette.open', lang)} onClick={() => setPaletteOpen(true)}>
            <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false">
              <circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
              <path d="m13 13 4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
          <button type="button" className="topbar-btn roll-host" data-magnetic="0.3" aria-haspopup="dialog" onClick={() => setIndexOpen(true)}>
            <RollText>{t('index.open', lang)}</RollText>
          </button>
          <LangToggle />
        </div>
      </header>
      <main ref={main} style={seams}>
        <Hero colors={colors} projectCount={projects.length} live={cinema} paused={covered} />
        <About animated={cinema} onOpenProject={openProject} focusSkill={focusSkill} />
        <section id="projetos" aria-label={t('projects.title', lang)}>
          {cinema ? <CinemaStage chapters={chapters} onOpen={openProject} paused={covered} /> : <StaticChapters chapters={chapters} onOpen={openProject} />}
        </section>
        <Contact colors={colors} live={cinema} animated={cinema} onTop={toTop} paused={covered} />
      </main>
      <IndexPanel open={indexOpen && !open} projects={projects} onClose={() => setIndexOpen(false)} onOpenProject={openProject} />
      <CommandPalette
        open={paletteOpen && !open}
        projects={projects}
        onClose={() => setPaletteOpen(false)}
        onPickSection={pickSection}
        onPickProject={openProject}
        onPickSkill={pickSkill}
      />
      {open && <ProjectModal project={open} onClose={close} />}
    </>
  )
}
