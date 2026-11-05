import { useState, type CSSProperties } from 'react'
import type { Chapter } from '../../lib/chapters'
import { asset } from '../../lib/assets'
import { paletteFor } from '../../lib/palette'
import { ChapterContent } from './ChapterText'
import './StaticChapters.css'

type Props = { chapters: Chapter[]; onOpen: (id: string) => void }

function StaticChapter({ chapter, index, onOpen }: { chapter: Chapter; index: number; onOpen: (id: string) => void }) {
  const [broken, setBroken] = useState(false)
  const { ground, ink, accent } = paletteFor(chapter.id)
  // Custom properties are not in CSSProperties' keys, hence the cast.
  const style = { '--ground': ground, '--ink': ink, '--accent-chapter': accent, background: 'var(--ground)' } as CSSProperties
  return (
    <section className="static-chapter" style={style}>
      {!broken && (
        <img className="static-chapter-bg" src={asset(chapter.project.fundo)} alt="" loading="lazy" onError={() => setBroken(true)} />
      )}
      <ChapterContent chapter={chapter} index={index} onOpen={onOpen} />
    </section>
  )
}

/** Fallback for reduced motion, no WebGL or weak devices: every chapter stacked, no transforms. */
export function StaticChapters({ chapters, onOpen }: Props) {
  return (
    <>
      {chapters.map((c, i) => (
        <StaticChapter key={c.id} chapter={c} index={i} onOpen={onOpen} />
      ))}
    </>
  )
}
