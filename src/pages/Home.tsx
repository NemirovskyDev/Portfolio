import { useMemo } from 'react'
import type { Project } from '../lib/types'
import { categoriesFor, featuredFor, type Profile } from '../lib/profiles'
import { t } from '../lib/i18n'
import { useHashProject } from '../lib/useHashProject'
import { useAppState } from '../state/AppState'
import { About } from '../components/About/About'
import { Hero } from '../components/Hero/Hero'
import { LangToggle } from '../components/LangToggle'
import { ProjectModal } from '../components/ProjectModal/ProjectModal'
import { Row } from '../components/Row/Row'
import { TunnelRows } from '../components/TunnelRows/TunnelRows'
import './Home.css'

type Props = { profile: Profile; projects: Project[]; onSwitchProfile: () => void }

export function Home({ profile, projects, onSwitchProfile }: Props) {
  const { lang } = useAppState()
  const { project: open, open: openProject, close } = useHashProject(projects)
  const rows = useMemo(() => categoriesFor(profile, projects), [profile, projects])
  const featured = useMemo(() => featuredFor(profile, projects), [profile, projects])

  return (
    <>
      <header className="topbar">
        <span className="wordmark">{t('site.name', lang)}</span>
        <div className="topbar-actions">
          <button type="button" className="topbar-btn" onClick={onSwitchProfile}>
            {t('profile.switch', lang)}
          </button>
          <LangToggle />
        </div>
      </header>
      <main>
        {featured && <Hero project={featured} onOpen={openProject} />}
        <TunnelRows>
          {rows.map((r) => (
            <Row key={r.categoria} categoria={r.categoria} projects={r.items} onOpen={openProject} />
          ))}
        </TunnelRows>
        <About />
      </main>
      {open && <ProjectModal project={open} onClose={close} />}
    </>
  )
}
