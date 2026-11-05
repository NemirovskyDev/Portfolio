import { Fragment, useRef, type ReactNode } from 'react'
import type { Chapter } from '../../lib/chapters'
import { useProgressEffect, type Progress } from '../../lib/progress'
import { categoryLabel, statusLabel, t } from '../../lib/i18n'
import { useReducedMotion } from '../../lib/useReducedMotion'
import { useAppState } from '../../state/AppState'
import './ChapterText.css'

const MAX_TAGS = 4
// Each word of the title starts a little later than the previous one, so the title reads line by line.
const STAGGER = 0.15
const MAX_STAGGERED = 3 // keeps long titles fully visible by the time the chapter is centered

type ContentProps = {
  chapter: Chapter
  index: number
  onOpen: (id: string) => void
  /** Scroll position `f`. Without it nothing is animated (static chapters, reduced motion). */
  progress?: Progress
}

function clamp01(n: number): number {
  return Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0
}

/** One title word: rises into place and unmasks while `f` approaches its chapter. */
function AnimatedWord({ word, index, order, progress }: { word: string; index: number; order: number; progress: Progress }) {
  const el = useRef<HTMLSpanElement>(null)
  useProgressEffect(progress, (f) => {
    if (!el.current) return
    // `enter` is 0 half a chapter before and 1 just before it is centered; the wrapper handles leaving upward.
    const enter = clamp01((f - index + 0.5) / 0.4 - Math.min(order, MAX_STAGGERED) * STAGGER)
    el.current.style.clipPath = `inset(0 0 ${((1 - enter) * 100).toFixed(1)}% 0)`
    el.current.style.transform = `translateY(${((1 - enter) * 60).toFixed(1)}%)`
  })
  return (
    <span ref={el} className="chapter-word">
      {word}
    </span>
  )
}

function Title({ text, index, progress }: { text: string; index: number; progress?: Progress }) {
  const words = text.split(' ')
  return (
    <h2 className="chapter-title">
      {words.map((w, i) => (
        // the plain-text space sits between the inline-block words so the accessible name keeps it
        <Fragment key={`${i}-${w}`}>
          {i > 0 ? ' ' : null}
          <span className="chapter-line">
            {progress ? <AnimatedWord word={w} index={index} order={i} progress={progress} /> : <span className="chapter-word">{w}</span>}
          </span>
        </Fragment>
      ))}
    </h2>
  )
}

/** Wrapper that moves the whole block up and fades it once the chapter has passed. */
function Leaving({ index, progress, children }: { index: number; progress: Progress; children: ReactNode }) {
  const el = useRef<HTMLDivElement>(null)
  useProgressEffect(progress, (f) => {
    if (!el.current) return
    el.current.style.transform = `translateY(${(-clamp01(f - index) * 12).toFixed(2)}svh)`
    // fades in over the last 0.3 chapters before centering, so the summary does not pop in while the title is still masked
    el.current.style.opacity = String(Math.min(1 - clamp01((f - index) / 0.5), clamp01((f - index + 0.5) / 0.3)))
  })
  return (
    <div ref={el} className="chapter-block">
      {children}
    </div>
  )
}

/** Presentational content shared by the animated stage and the static chapters. */
export function ChapterContent({ chapter, index, onOpen, progress }: ContentProps) {
  const { lang } = useAppState()
  const { project } = chapter
  const body = (
    <>
      <Title text={project.titulo[lang]} index={index} progress={progress} />
      <p className="chapter-meta">
        <span>{categoryLabel(project.categoria, lang)}</span>
        <span>{statusLabel(project.status, lang)}</span>
      </p>
      <p className="chapter-summary">{project.resumo[lang]}</p>
      <ul className="chapter-tags" role="list">
        {project.stack.slice(0, MAX_TAGS).map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
      <button
        type="button"
        className="chapter-open"
        aria-label={`${t('chapter.details', lang)}: ${project.titulo[lang]}`}
        onClick={() => onOpen(project.id)}
      >
        {t('chapter.details', lang)}
      </button>
    </>
  )

  return progress ? <Leaving index={index} progress={progress}>{body}</Leaving> : <div className="chapter-block">{body}</div>
}

type Props = {
  chapter: Chapter
  index: number
  progress: Progress
  active: boolean
  onOpen: (id: string) => void
}

export function ChapterText({ chapter, index, progress, active, onOpen }: Props) {
  const reduce = useReducedMotion()
  return (
    // visibility:hidden takes inactive chapters out of the tab order and the accessibility tree
    <div className="chapter-text" style={active ? undefined : { visibility: 'hidden' }}>
      <ChapterContent chapter={chapter} index={index} onOpen={onOpen} progress={reduce ? undefined : progress} />
    </div>
  )
}
