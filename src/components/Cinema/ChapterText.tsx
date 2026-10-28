import { Fragment, type ReactNode } from 'react'
import { motion, useTransform, type MotionValue } from 'motion/react'
import type { Chapter } from '../../lib/chapters'
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
  count?: number
  onOpen: (id: string) => void
  /** Scroll position `f`. Without it nothing is animated (static chapters, reduced motion). */
  progress?: MotionValue<number>
}

function clamp01(n: number): number {
  return Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0
}

/** One title word: rises into place and unmasks while `f` approaches its chapter. */
function AnimatedWord({ word, index, order, progress }: { word: string; index: number; order: number; progress: MotionValue<number> }) {
  // `enter` is 0 half a chapter before and 1 just before it is centered; the wrapper handles leaving upward.
  const enter = useTransform(progress, (f) => clamp01((f - index + 0.5) / 0.4 - Math.min(order, MAX_STAGGERED) * STAGGER))
  const clipPath = useTransform(enter, (e) => `inset(0 0 ${((1 - e) * 100).toFixed(1)}% 0)`)
  const y = useTransform(enter, (e) => `${((1 - e) * 60).toFixed(1)}%`)
  return (
    <motion.span className="chapter-word" style={{ clipPath, y }}>
      {word}
    </motion.span>
  )
}

function Title({ as: Tag, text, index, progress }: { as: 'p' | 'h2'; text: string; index: number; progress?: MotionValue<number> }) {
  const words = text.split(' ')
  return (
    // the opening title repeats the header's h1, so it is hidden from assistive technology (the header stays visible in every chapter)
    <Tag className={Tag === 'p' ? 'chapter-title chapter-title--opening' : 'chapter-title'} aria-hidden={Tag === 'p' ? true : undefined}>
      {words.map((w, i) => (
        // the plain-text space sits between the inline-block words so the accessible name keeps it
        <Fragment key={`${i}-${w}`}>
          {i > 0 ? ' ' : null}
          <span className="chapter-line">
            {progress ? <AnimatedWord word={w} index={index} order={i} progress={progress} /> : <span className="chapter-word">{w}</span>}
          </span>
        </Fragment>
      ))}
    </Tag>
  )
}

/** Wrapper that moves the whole block up and fades it once the chapter has passed. */
function Leaving({ index, progress, children }: { index: number; progress: MotionValue<number>; children: ReactNode }) {
  const y = useTransform(progress, (f) => `${(-clamp01(f - index) * 12).toFixed(2)}svh`)
  // fades in over the last 0.3 chapters before centering, so the summary does not pop in while the title is still masked
  const opacity = useTransform(progress, (f) => Math.min(1 - clamp01((f - index) / 0.5), clamp01((f - index + 0.5) / 0.3)))
  return (
    <motion.div className="chapter-block" style={{ y, opacity }}>
      {children}
    </motion.div>
  )
}

/** Presentational content shared by the animated stage and the static chapters. */
export function ChapterContent({ chapter, index, count, onOpen, progress }: ContentProps) {
  const { lang } = useAppState()
  if (chapter.kind === 'credits') return null

  const body =
    chapter.kind === 'opening' ? (
      <>
        <Title as="p" text={t('site.name', lang)} index={index} progress={progress} />
        <p className="chapter-summary">{t('opening.line', lang)}</p>
        <p className="chapter-meta">
          {typeof count === 'number' ? <span>{t('opening.count', lang).replace('{n}', String(count))}</span> : null}
          <span className="chapter-scroll">{t('opening.scroll', lang)}</span>
        </p>
      </>
    ) : (
      <>
        <Title as="h2" text={chapter.project.titulo[lang]} index={index} progress={progress} />
        <p className="chapter-meta">
          <span>{categoryLabel(chapter.project.categoria, lang)}</span>
          <span>{statusLabel(chapter.project.status, lang)}</span>
        </p>
        <p className="chapter-summary">{chapter.project.resumo[lang]}</p>
        <ul className="chapter-tags" role="list">
          {chapter.project.stack.slice(0, MAX_TAGS).map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <button
          type="button"
          className="chapter-open"
          aria-label={`${t('chapter.details', lang)}: ${chapter.project.titulo[lang]}`}
          onClick={() => onOpen(chapter.project.id)}
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
  progress: MotionValue<number>
  active: boolean
  count?: number
  onOpen: (id: string) => void
}

export function ChapterText({ chapter, index, progress, active, count, onOpen }: Props) {
  const reduce = useReducedMotion()
  if (chapter.kind === 'credits') return null
  return (
    // visibility:hidden takes inactive chapters out of the tab order and the accessibility tree
    <div className="chapter-text" style={active ? undefined : { visibility: 'hidden' }}>
      <ChapterContent chapter={chapter} index={index} count={count} onOpen={onOpen} progress={reduce ? undefined : progress} />
    </div>
  )
}
