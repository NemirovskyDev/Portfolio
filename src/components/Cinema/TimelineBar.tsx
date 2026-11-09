import { useEffect, useRef } from 'react'
import { useProgressEffect, type Progress } from '../../lib/progress'
import type { Chapter } from '../../lib/chapters'
import { t } from '../../lib/i18n'
import type { Lang } from '../../lib/types'
import { useAppState } from '../../state/AppState'
import './TimelineBar.css'

type Props = {
  chapters: Chapter[]
  activeIndex: number
  onJump: (index: number) => void
  /** Scroll position `f`; when given, each marker fills like a loading bar as `f` reaches it. */
  progress?: Progress
}

/** Marker `index` is empty until `f` leaves the previous chapter and full once `f` reaches it. */
function Fill({ index, progress }: { index: number; progress: Progress }) {
  const el = useRef<HTMLSpanElement>(null)
  useProgressEffect(progress, (f) => {
    if (!el.current) return
    const s = Math.min(1, Math.max(0, f - index + 1))
    el.current.style.transform = s >= 1 ? 'none' : `scaleX(${s})` // full is the identity transform
  })
  return <span ref={el} className="timeline-fill" aria-hidden="true" />
}

const pad = (n: number) => String(n).padStart(2, '0')

const chapterTitle = (c: Chapter, lang: Lang): string => c.project.titulo[lang]

// Markers group by category, with a gap before each new one.
const groupKey = (c: Chapter): string => c.project.categoria

export function TimelineBar({ chapters, activeIndex, onJump, progress }: Props) {
  const { lang } = useAppState()
  if (!chapters.length) return null
  const current = Math.min(Math.max(activeIndex, 0), chapters.length - 1)

  return (
    <TimelineView chapters={chapters} current={current} lang={lang} onJump={onJump} progress={progress} />
  )
}

function TimelineView({
  chapters,
  current,
  lang,
  onJump,
  progress,
}: {
  chapters: Chapter[]
  current: number
  lang: Lang
  onJump: (i: number) => void
  progress?: Progress
}) {
  const track = useRef<HTMLOListElement>(null)

  // On narrow screens the track scrolls sideways: keep the active marker centered. Scrolls only the track, never the page.
  useEffect(() => {
    const el = track.current
    const mark = el?.querySelector<HTMLElement>('[aria-current]')
    if (!el || !mark) return
    el.scrollTo?.({ left: mark.offsetLeft - el.clientWidth / 2 + mark.offsetWidth / 2, behavior: 'auto' })
  }, [current])

  return (
    <nav className={progress ? 'timeline timeline--fill' : 'timeline'} aria-label={t('timeline.label', lang)}>
      <p className="timeline-readout">
        <span className="timeline-current" data-testid="timeline-current">
          {chapterTitle(chapters[current], lang)}
        </span>
        <span className="timeline-counter">{`${pad(current + 1)} / ${pad(chapters.length)}`}</span>
      </p>
      {/* role="list" keeps list semantics in Safari, which drops them when list-style is none */}
      {/* eslint-disable-next-line jsx-a11y/no-redundant-roles */}
      <ol className="timeline-track" role="list" ref={track}>
        {chapters.map((c, i) => {
          const groupStart = i > 0 && groupKey(c) !== groupKey(chapters[i - 1])
          return (
            <li key={c.id} className={groupStart ? 'timeline-item timeline-item--group-start' : 'timeline-item'}>
              <button
                type="button"
                className="timeline-marker"
                data-magnetic="0.15"
                aria-label={chapterTitle(c, lang)}
                aria-current={i === current ? 'step' : undefined}
                onClick={() => onJump(i)}
              >
                {progress ? <Fill index={i} progress={progress} /> : null}
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
