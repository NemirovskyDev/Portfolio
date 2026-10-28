import { useMemo, useState } from 'react'
import type { Project } from '../lib/types'
import { buildChapters } from '../lib/chapters'
import { t } from '../lib/i18n'
import { useCinemaMode } from '../lib/useCinemaMode'
import { useHashProject } from '../lib/useHashProject'
import { useSmoothScroll } from '../lib/useSmoothScroll'
import { useAppState } from '../state/AppState'
import { CinemaStage } from '../components/Cinema/CinemaStage'
import { Credits } from '../components/Cinema/Credits'
import { IndexPanel } from '../components/Cinema/IndexPanel'
import { StaticChapters } from '../components/Cinema/StaticChapters'
import { LangToggle } from '../components/LangToggle'
import { ProjectModal } from '../components/ProjectModal/ProjectModal'
import './Home.css'

type Props = { projects: Project[] }

export function Home({ projects }: Props) {
  const { lang } = useAppState()
  const chapters = useMemo(() => buildChapters(projects), [projects])
  const mode = useCinemaMode()
  const { project: open, open: openProject, close } = useHashProject(projects)
  const [indexOpen, setIndexOpen] = useState(false)
  // The modal and the index own the wheel while open; Lenis would keep moving the page underneath.
  useSmoothScroll({ enabled: mode === 'cinema', paused: Boolean(open) || indexOpen })

  const toTop = () => window.scrollTo({ top: 0, behavior: 'auto' })

  const header = (
    <header className="topbar">
      <h1 className="wordmark">{t('site.fullName', lang)}</h1>
      <div className="topbar-actions">
        <button type="button" className="topbar-btn" aria-haspopup="dialog" onClick={() => setIndexOpen(true)}>
          {t('index.open', lang)}
        </button>
        <LangToggle />
      </div>
    </header>
  )

  return (
    <>
      <main>
        {mode === 'cinema' ? (
          <CinemaStage chapters={chapters} projectCount={projects.length} header={header} onOpen={openProject} />
        ) : (
          <>
            {header}
            <StaticChapters chapters={chapters} onOpen={openProject} />
            <section className="credits-static">
              <Credits onTop={toTop} />
            </section>
          </>
        )}
      </main>
      <IndexPanel open={indexOpen && !open} projects={projects} onClose={() => setIndexOpen(false)} onOpenProject={openProject} />
      {open && <ProjectModal project={open} onClose={close} />}
    </>
  )
}
