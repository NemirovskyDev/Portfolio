import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import type { Project } from '../lib/types'
import { buildChapters } from '../lib/chapters'
import { t } from '../lib/i18n'
import { ScrollTrigger } from '../lib/gsap'
import { fluidColors, paletteFor } from '../lib/palette'
import { useCinemaMode } from '../lib/useCinemaMode'
import { useHashProject } from '../lib/useHashProject'
import { scrollToTarget, useSmoothScroll } from '../lib/useSmoothScroll'
import { useAppState } from '../state/AppState'
import { About } from '../components/About/About'
import { CinemaStage } from '../components/Cinema/CinemaStage'
import { IndexPanel } from '../components/Cinema/IndexPanel'
import { StaticChapters } from '../components/Cinema/StaticChapters'
import { Contact } from '../components/Contact/Contact'
import { Hero } from '../components/Hero/Hero'
import { LangToggle } from '../components/LangToggle'
import { ProjectModal } from '../components/ProjectModal/ProjectModal'
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
  const [indexOpen, setIndexOpen] = useState(false)
  const main = useRef<HTMLElement>(null)
  // The modal and the index own the wheel while open; Lenis would keep moving the page underneath.
  useSmoothScroll({ enabled: cinema, paused: Boolean(open) || indexOpen })

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
          <button type="button" className="topbar-btn" aria-haspopup="dialog" onClick={() => setIndexOpen(true)}>
            {t('index.open', lang)}
          </button>
          <LangToggle />
        </div>
      </header>
      <main ref={main} style={seams}>
        <Hero colors={colors} projectCount={projects.length} live={cinema} />
        <About animated={cinema} />
        <section id="projetos" aria-label={t('projects.title', lang)}>
          {cinema ? <CinemaStage chapters={chapters} onOpen={openProject} /> : <StaticChapters chapters={chapters} onOpen={openProject} />}
        </section>
        <Contact colors={colors} live={cinema} animated={cinema} onTop={toTop} />
      </main>
      <IndexPanel open={indexOpen && !open} projects={projects} onClose={() => setIndexOpen(false)} onOpenProject={openProject} />
      {open && <ProjectModal project={open} onClose={close} />}
    </>
  )
}
