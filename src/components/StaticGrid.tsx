import type { Project } from '../lib/types'
import { ProjectCard } from './ProjectCard/ProjectCard'
import './StaticGrid.css'

/** Fallback layout: every project in a plain grid, no effects. */
export function StaticGrid({ projects, onOpen }: { projects: Project[]; onOpen: (id: string) => void }) {
  return (
    <ul className="static-grid">
      {projects.map((p) => (
        <li key={p.id}>
          <ProjectCard project={p} onOpen={onOpen} />
        </li>
      ))}
    </ul>
  )
}
