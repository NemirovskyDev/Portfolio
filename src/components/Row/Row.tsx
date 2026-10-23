import { useId } from 'react'
import type { Project } from '../../lib/types'
import { categoryLabel } from '../../lib/i18n'
import { useAppState } from '../../state/AppState'
import { ProjectCard } from '../ProjectCard/ProjectCard'
import './Row.css'

type Props = { categoria: string; projects: Project[]; onOpen: (id: string) => void }

export function Row({ categoria, projects, onOpen }: Props) {
  const { lang } = useAppState()
  const headingId = useId()
  return (
    <section className="row" aria-labelledby={headingId}>
      <h2 id={headingId} className="row-title">
        {categoryLabel(categoria, lang)}
      </h2>
      <ul className="row-list">
        {projects.map((p) => (
          <li key={p.id} className="row-item">
            <ProjectCard project={p} onOpen={onOpen} />
          </li>
        ))}
      </ul>
    </section>
  )
}
