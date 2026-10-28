import { useId } from 'react'
import { motion } from 'motion/react'
import type { Project } from '../../lib/types'
import { categoryLabel } from '../../lib/i18n'
import { useAppState } from '../../state/AppState'
import { cardVariants } from '../RevealRows/RevealRows'
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
      <ul className="row-list" role="list">
        {projects.map((p) => (
          <motion.li key={p.id} className="row-item" variants={cardVariants}>
            <ProjectCard project={p} onOpen={onOpen} />
          </motion.li>
        ))}
      </ul>
    </section>
  )
}
