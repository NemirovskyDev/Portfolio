import { useMemo, useRef, useState, type CSSProperties } from 'react'
import { asset } from '../../lib/assets'
import { gsap } from '../../lib/gsap'
import { useProgressEffect } from '../../lib/progress'
import { activeIndex, type Chapter } from '../../lib/chapters'
import { useAppState } from '../../state/AppState'
import { paletteFor } from '../../lib/palette'
import { useStageProgress } from '../../lib/useStageProgress'
import { ChapterText } from './ChapterText'
import { StageCanvas } from './StageCanvas'
import { TimelineBar } from './TimelineBar'
import './CinemaStage.css'

// Each chapter gets this much scroll; one extra lets the last project rest before the contact section arrives.
const CHAPTER_SVH = 130
const EXTRA_CHAPTERS = 1

type Props = {
  chapters: Chapter[]
  onOpen: (id: string) => void
}

/** The projects: one tall block whose scroll drives the 3D shelf, the text, the color and the timeline. */
export function CinemaStage({ chapters, onOpen }: Props) {
  const stageRef = useRef<HTMLDivElement>(null)
  const last = chapters.length - 1
  const stickyRef = useRef<HTMLDivElement>(null)
  const progress = useStageProgress(stageRef, chapters.length)
  const [active, setActive] = useState(0)
  const [announce, setAnnounce] = useState('')
  const { lang } = useAppState()

  // One interpolator per color across every chapter, so the page blends from one project's palette to the next.
  const blend = useMemo(() => {
    const palettes = chapters.map((c) => paletteFor(c.id))
    const across = (key: 'ground' | 'ink' | 'accent') => {
      const colors = palettes.map((p) => p[key])
      // a single chapter has nothing to blend between
      return colors.length > 1 ? gsap.utils.interpolate(colors) : () => colors[0] ?? '#08090c'
    }
    return { ground: across('ground'), ink: across('ink'), accent: across('accent') }
  }, [chapters])

  useProgressEffect(progress, (f) => {
    setActive(activeIndex(f, chapters.length)) // React skips the render when the index did not change
    const el = stickyRef.current
    if (!el) return
    const p = last > 0 ? Math.min(Math.max(f / last, 0), 1) : 0
    const ground = blend.ground(p)
    el.style.setProperty('--ground', ground)
    el.style.setProperty('--ink', blend.ink(p))
    el.style.setProperty('--accent-chapter', blend.accent(p))
    el.style.backgroundColor = ground
  })

  const covers = useMemo(() => chapters.map((c) => asset(c.project.capa)), [chapters])
  const backdrops = useMemo(() => chapters.map((c) => asset(c.project.fundo)), [chapters])

  const jumpTo = (index: number) => {
    const el = stageRef.current
    if (!el || last < 1) return
    const travel = Math.max(el.offsetHeight - window.innerHeight, 0)
    // page offset from the layout box: the stage sits inside its section, so offsetTop alone is not enough
    const top = el.getBoundingClientRect().top + window.scrollY
    window.scrollTo({ top: Math.max(top + (index / last) * travel, 0), behavior: 'auto' })
    // a jump swaps the visible chapter while focus stays on the marker, so say what is now showing
    const c = chapters[index]
    if (c) setAnnounce(`${c.project.titulo[lang]}, ${index + 1}/${chapters.length}`)
  }

  const style = {
    height: `${(chapters.length + EXTRA_CHAPTERS) * CHAPTER_SVH}svh`,
  } as CSSProperties
  return (
    <div ref={stageRef} className="cinema" style={style}>
      <div ref={stickyRef} className="cinema-sticky">
        <StageCanvas covers={covers} backdrops={backdrops} progress={progress} fallback={null} />
        <div className="cinema-scrim" aria-hidden="true" />
        <div className="cinema-bar cinema-bar--top" aria-hidden="true" />
        <div className="cinema-bar cinema-bar--bottom" aria-hidden="true" />
        {chapters.map((c, i) => (
          <ChapterText key={c.id} chapter={c} index={i} progress={progress} active={i === active} onOpen={onOpen} />
        ))}
        <p className="sr-only" role="status" aria-live="polite">
          {announce}
        </p>
        <TimelineBar chapters={chapters} activeIndex={active} onJump={jumpTo} progress={progress} />
        <div className="cinema-grain" aria-hidden="true" />
      </div>
    </div>
  )
}
