import { useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { motion, useMotionValueEvent, useTransform } from 'motion/react'
import { asset } from '../../lib/assets'
import { activeIndex, type Chapter } from '../../lib/chapters'
import { t } from '../../lib/i18n'
import { useAppState } from '../../state/AppState'
import { paletteFor } from '../../lib/palette'
import { useStageProgress } from '../../lib/useStageProgress'
import { ChapterText } from './ChapterText'
import { Credits } from './Credits'
import { StageCanvas } from './StageCanvas'
import { TimelineBar } from './TimelineBar'
import './CinemaStage.css'

// Each chapter gets this much scroll; two extra give the opening and the credits room to breathe.
const CHAPTER_SVH = 130
const EXTRA_CHAPTERS = 2

type Props = {
  chapters: Chapter[]
  /** Number of projects, shown on the opening. */
  projectCount: number
  /** Rendered inside the stage so it inherits the chapter colors. */
  header: ReactNode
  onOpen: (id: string) => void
}

/** The animated page: one tall block whose scroll drives the 3D shelf, the text, the color and the timeline. */
export function CinemaStage({ chapters, projectCount, header, onOpen }: Props) {
  const stageRef = useRef<HTMLDivElement>(null)
  const last = chapters.length - 1
  const progress = useStageProgress(stageRef, chapters.length)
  const [active, setActive] = useState(0)
  const [announce, setAnnounce] = useState('')
  const { lang } = useAppState()
  useMotionValueEvent(progress, 'change', (f) => setActive(activeIndex(f, chapters.length)))

  const palettes = useMemo(() => chapters.map((c) => paletteFor(c.id)), [chapters])
  const stops = useMemo(() => chapters.map((_, i) => i), [chapters])
  // A single chapter has nothing to interpolate between; motion needs at least two stops.
  const interpolate = <K extends 'ground' | 'ink' | 'accent'>(key: K) =>
    palettes.length > 1 ? palettes.map((p) => p[key]) : [palettes[0]?.[key] ?? '#08090c', palettes[0]?.[key] ?? '#08090c']
  const ground = useTransform(progress, palettes.length > 1 ? stops : [0, 1], interpolate('ground'))
  const ink = useTransform(progress, palettes.length > 1 ? stops : [0, 1], interpolate('ink'))
  const accent = useTransform(progress, palettes.length > 1 ? stops : [0, 1], interpolate('accent'))

  const covers = useMemo(() => chapters.map((c) => (c.kind === 'project' ? asset(c.project.capa) : '')), [chapters])
  const backdrops = useMemo(() => chapters.map((c) => (c.kind === 'project' ? asset(c.project.fundo) : '')), [chapters])

  const jumpTo = (index: number) => {
    const el = stageRef.current
    if (!el || last < 1) return
    const travel = Math.max(el.offsetHeight - window.innerHeight, 0)
    window.scrollTo({ top: Math.max(el.offsetTop + (index / last) * travel, 0), behavior: 'auto' })
    // a jump swaps the visible chapter while focus stays on the marker, so say what is now showing
    const c = chapters[index]
    if (c) setAnnounce(`${c.kind === 'project' ? c.project.titulo[lang] : c.kind === 'opening' ? t('site.fullName', lang) : t('about.title', lang)}, ${index + 1}/${chapters.length}`)
  }

  // the closing button vanishes with the credits, so focus moves to the timeline instead of falling to <body>
  const backToTop = () => {
    jumpTo(0)
    stageRef.current?.querySelector<HTMLElement>('.timeline-marker')?.focus()
  }

  const style = {
    height: `${(chapters.length + EXTRA_CHAPTERS) * CHAPTER_SVH}svh`,
  } as CSSProperties
  // Custom properties are not in CSSProperties' keys; motion accepts motion values for them.
  const stickyStyle = {
    '--ground': ground,
    '--ink': ink,
    '--accent-chapter': accent,
    backgroundColor: ground,
  } as unknown as Record<string, unknown>

  return (
    <div ref={stageRef} className="cinema" style={style}>
      <motion.div className="cinema-sticky" style={stickyStyle}>
        <StageCanvas covers={covers} backdrops={backdrops} progress={progress} fallback={null} />
        <div className="cinema-scrim" aria-hidden="true" />
        <div className="cinema-bar cinema-bar--top" aria-hidden="true" />
        <div className="cinema-bar cinema-bar--bottom" aria-hidden="true" />
        {header}
        {chapters.map((c, i) => (
          <ChapterText key={c.id} chapter={c} index={i} progress={progress} active={i === active} count={projectCount} onOpen={onOpen} />
        ))}
        <div className="cinema-credits" style={hiddenStyle(active !== last)}>
          <Credits onTop={backToTop} />
        </div>
        <p className="sr-only" role="status" aria-live="polite">
          {announce}
        </p>
        <TimelineBar chapters={chapters} activeIndex={active} onJump={jumpTo} />
        <div className="cinema-grain" aria-hidden="true" />
      </motion.div>
    </div>
  )
}

// visibility (not display) keeps the layout and takes the hidden chapter out of the tab order
function hiddenStyle(hidden: boolean): CSSProperties | undefined {
  return hidden ? { visibility: 'hidden' } : undefined
}
