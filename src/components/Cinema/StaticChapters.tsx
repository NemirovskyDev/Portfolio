import { useState, type CSSProperties } from 'react'
import type { Chapter } from '../../lib/chapters'
import { asset } from '../../lib/assets'
import { paletteFor } from '../../lib/palette'
import { ChapterContent } from './ChapterText'
import './StaticChapters.css'

type Props = { chapters: Chapter[]; onOpen: (id: string) => void }

function StaticChapter({ chapter, index, count, onOpen }: { chapter: Chapter; index: number; count: number; onOpen: (id: string) => void }) {
  const [broken, setBroken] = useState(false)
  const { ground, ink, accent } = paletteFor(chapter.id)
  // Custom properties are not in CSSProperties' keys, hence the cast.
  const style = { '--ground': ground, '--ink': ink, '--accent-chapter': accent, background: 'var(--ground)' } as CSSProperties
  return (
    <section className="static-chapter" style={style}>
      {chapter.kind === 'project' && !broken && (
        <img className="static-chapter-bg" src={asset(chapter.project.fundo)} alt="" loading="lazy" onError={() => setBroken(true)} />
      )}
      <ChapterContent chapter={chapter} index={index} count={count} onOpen={onOpen} />
    </section>
  )
}

/** Fallback for reduced motion, no WebGL or weak devices: every chapter stacked, no transforms. Credits belong to the page. */
export function StaticChapters({ chapters, onOpen }: Props) {
  const shown = chapters.filter((c) => c.kind !== 'credits')
  const projectCount = shown.filter((c) => c.kind === 'project').length
  return (
    <>
      {shown.map((c, i) => (
        <StaticChapter key={c.id} chapter={c} index={i} count={projectCount} onOpen={onOpen} />
      ))}
    </>
  )
}
