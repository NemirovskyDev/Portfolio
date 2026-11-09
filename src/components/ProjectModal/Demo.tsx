import { useEffect, useRef, useState } from 'react'
import type { Lang, Project } from '../../lib/types'
import { asset } from '../../lib/assets'
import { t } from '../../lib/i18n'
import './Demo.css'

type Props = { project: Project; lang: Lang }

const SLOW_MS = 10_000
const WIDE = '(min-width: 768px)'

/** Frames need room to be usable; on phones the demo is a link to the site itself. */
function useWide(): boolean {
  const [wide, setWide] = useState(() => window.matchMedia?.(WIDE).matches ?? true)
  useEffect(() => {
    const mq = window.matchMedia?.(WIDE)
    if (!mq) return
    const on = () => setWide(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return wide
}

const resolve = (url: string) => (/^https?:/i.test(url) ? url : asset(url))
const named = (key: string, lang: Lang, name: string) => t(key, lang).replace('{name}', name)

/** The live site inside a browser-like frame. Nothing loads until the visitor asks, so opening a project stays light. */
function SiteDemo({ project, lang, url }: { project: Project; lang: Lang; url: string }) {
  const wide = useWide()
  const frame = useRef<HTMLDivElement>(null)
  const [started, setStarted] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [slow, setSlow] = useState(false)
  // Sites with their own smooth scroll swallow the wheel, so a frame under the pointer would trap the window.
  // Until the visitor clicks, a shield lets the wheel scroll the window.
  const [active, setActive] = useState(false)
  const href = resolve(url)
  const isApp = !/^https?:/i.test(url)
  const poster = project.galeria?.[0]?.src ?? project.fundo
  const canFullscreen = typeof document !== 'undefined' && document.fullscreenEnabled

  // Inside the frame the page outside gets no pointer events (and mouseleave also fires when the pointer ENTERS an iframe),
  // so any pointer movement this page does see means the pointer left the frame: the shield goes back up.
  useEffect(() => {
    if (!active) return
    let off: (() => void) | undefined
    // wait a moment so the movement that follows the click itself is not taken for leaving
    const arm = window.setTimeout(() => {
      const back = () => setActive(false)
      document.addEventListener('pointermove', back, { once: true })
      off = () => document.removeEventListener('pointermove', back)
    }, 250)
    return () => {
      window.clearTimeout(arm)
      off?.()
    }
  }, [active])

  useEffect(() => {
    if (!started || loaded) return
    const id = window.setTimeout(() => setSlow(true), SLOW_MS)
    return () => window.clearTimeout(id)
  }, [started, loaded])

  const newTab = (
    <a className="demo-btn" href={href} target="_blank" rel="noopener noreferrer">
      {t('demo.newTab', lang)}
    </a>
  )

  if (!wide) return <div className="demo-actions">{newTab}</div>

  return (
    <div ref={frame} className="demo-frame">
      <div className="demo-bar">
        <span className="demo-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="demo-url">{isApp ? project.titulo[lang] : href.replace(/^https:\/\//, '')}</span>
        <span className="demo-tools">
          {canFullscreen && started && (
            <button type="button" className="demo-btn" onClick={() => frame.current?.requestFullscreen?.().catch(() => {})}>
              {t('demo.fullscreen', lang)}
            </button>
          )}
          {newTab}
        </span>
      </div>
      <div className="demo-screen">
        {started ? (
          <>
            <iframe
              className="demo-iframe"
              src={href}
              title={named('demo.frame', lang, project.titulo[lang])}
              loading="lazy"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              onLoad={() => setLoaded(true)}
            />
            {!active && (
              <button type="button" className="demo-shield" onClick={() => setActive(true)}>
                <span>{t('demo.interact', lang)}</span>
              </button>
            )}
            {!loaded && (
              <p className="demo-note" role="status">
                {slow ? t('demo.slow', lang) : t('demo.loading', lang)}
              </p>
            )}
          </>
        ) : (
          <button type="button" className="demo-start" onClick={() => setStarted(true)}>
            <img src={asset(poster)} alt="" loading="lazy" />
            <span>{t(isApp ? 'demo.startApp' : 'demo.start', lang)}</span>
          </button>
        )}
      </div>
    </div>
  )
}

/** A short recorded run-through. preload="none" and no autoplay: it downloads only when the visitor presses play. */
function VideoDemo({ project, lang, src, poster, caption }: { project: Project; lang: Lang; src: string; poster: string; caption: string }) {
  return (
    <figure className="demo-video">
      {/* screen recordings with no audio track: nothing is spoken, so there is nothing to caption; figcaption describes what it shows */}
      <video controls muted preload="none" playsInline poster={asset(poster)} aria-label={named('demo.video', lang, project.titulo[lang])}>
        <source src={asset(src)} type={src.endsWith('.webm') ? 'video/webm' : 'video/mp4'} />
      </video>
      <figcaption>{caption}</figcaption>
    </figure>
  )
}

/** Last section of the project window: try the real thing, or watch it run. */
export function Demo({ project, lang }: Props) {
  const demo = project.demo
  if (!demo) return null
  return (
    <section className="demo" aria-labelledby={`demo-${project.id}`}>
      <h3 id={`demo-${project.id}`}>{t('demo.title', lang)}</h3>
      {demo.tipo === 'site' ? (
        <SiteDemo project={project} lang={lang} url={demo.url} />
      ) : (
        <VideoDemo project={project} lang={lang} src={demo.src} poster={demo.poster} caption={demo.legenda[lang]} />
      )}
    </section>
  )
}
