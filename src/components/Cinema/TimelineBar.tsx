import { useEffect, useRef } from 'react'
import type { Chapter } from '../../lib/chapters'
import { t } from '../../lib/i18n'
import type { Lang } from '../../lib/types'
import { useAppState } from '../../state/AppState'
import './TimelineBar.css'

type Props = { chapters: Chapter[]; activeIndex: number; onJump: (index: number) => void }

const pad = (n: number) => String(n).padStart(2, '0')

function chapterTitle(c: Chapter, lang: Lang): string {
  if (c.kind === 'opening') return t('site.name', lang)
  if (c.kind === 'credits') return t('about.title', lang)
  return c.project.titulo[lang]
}

// Opening and credits are groups of their own; projects group by category.
const groupKey = (c: Chapter): string => (c.kind === 'project' ? c.project.categoria : c.kind)

export function TimelineBar({ chapters, activeIndex, onJump }: Props) {
  const { lang } = useAppState()
  if (!chapters.length) return null
  const current = Math.min(Math.max(activeIndex, 0), chapters.length - 1)

  return (
    <TimelineView chapters={chapters} current={current} lang={lang} onJump={onJump} />
  )
}

function TimelineView({ chapters, current, lang, onJump }: { chapters: Chapter[]; current: number; lang: Lang; onJump: (i: number) => void }) {
  const track = useRef<HTMLOListElement>(null)
  const projectTotal = chapters.filter((c) => c.kind === 'project').length
  const projectNumber = chapters.slice(0, current + 1).filter((c) => c.kind === 'project').length

  // On narrow screens the track scrolls sideways: keep the active marker centered. Scrolls only the track, never the page.
  useEffect(() => {
    const el = track.current
    const mark = el?.querySelector<HTMLElement>('[aria-current]')
    if (!el || !mark) return
    el.scrollTo?.({ left: mark.offsetLeft - el.clientWidth / 2 + mark.offsetWidth / 2, behavior: 'auto' })
  }, [current])

  return (
    <nav className="timeline" aria-label={t('timeline.label', lang)}>
      <p className="timeline-readout">
        <span className="timeline-current" data-testid="timeline-current">
          {chapterTitle(chapters[current], lang)}
        </span>
        {/* counts projects only: the opening and the credits are not numbered */}
        <span className="timeline-counter">
          {chapters[current].kind === 'project' ? `${pad(projectNumber)} / ${pad(projectTotal)}` : null}
        </span>
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
                aria-label={chapterTitle(c, lang)}
                aria-current={i === current ? 'step' : undefined}
                onClick={() => onJump(i)}
              />
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
