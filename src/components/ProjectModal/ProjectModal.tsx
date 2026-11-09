import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { gsap, useGSAP } from '../../lib/gsap'
import type { Lang, Project } from '../../lib/types'
import { asset } from '../../lib/assets'
import { takeCoverOrigin, type CoverOrigin } from '../../lib/coverOrigin'
import { linkLabel, statusLabel, t } from '../../lib/i18n'
import { useReducedMotion } from '../../lib/useReducedMotion'
import { useAppState } from '../../state/AppState'
import { RollText } from '../RollText'
import { Demo } from './Demo'
import { Lightbox } from './Lightbox'
import './ProjectModal.css'

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
// Prints are ~800x500 screenshots; the attributes reserve space before they load (no layout shift).
const SHOT_WIDTH = 800
const SHOT_HEIGHT = 500

type Props = { project: Project; onClose: () => void }

function DownloadIcon() {
  return (
    <svg className="external-icon" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
      <path d="M8 2v8m0 0 3-3m-3 3L5 7M3 13h10" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ExternalIcon() {
  return (
    <svg className="external-icon" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
      <path d="M6 3h7v7M13 3 4 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** Prints that fail to load disappear; when none is left, the whole section (heading included) goes too. */
function Gallery({ items, lang }: { items: NonNullable<Project['galeria']>; lang: Lang }) {
  const [failed, setFailed] = useState<ReadonlySet<string>>(new Set())
  const [open, setOpen] = useState<number | null>(null)
  const opener = useRef<HTMLElement | null>(null)
  const visible = items.filter((g) => !failed.has(g.src))
  if (!visible.length) return null

  const show = (i: number, from: HTMLElement) => {
    opener.current = from
    setOpen(i)
  }
  const close = () => {
    setOpen(null)
    // give focus back to the print that was opened, if it is still on the page
    queueMicrotask(() => opener.current?.isConnected && opener.current.focus())
  }

  return (
    <>
      <h3>{t('modal.gallery', lang)}</h3>
      {/* role="list" keeps list semantics in Safari, which drops them when list-style is none */}
      <ul className="gallery" role="list">
        {visible.map((g, i) => (
          <li key={g.src}>
            <button type="button" className="gallery-thumb" onClick={(e) => show(i, e.currentTarget)}>
              <img
                src={asset(g.src)}
                alt={g.alt[lang]}
                width={SHOT_WIDTH}
                height={SHOT_HEIGHT}
                loading="lazy"
                onError={() => setFailed((prev) => new Set(prev).add(g.src))}
              />
              <span className="sr-only"> ({t('lightbox.enlarge', lang)})</span>
            </button>
          </li>
        ))}
      </ul>
      {open !== null && <Lightbox items={visible} index={Math.min(open, visible.length - 1)} lang={lang} onIndex={setOpen} onClose={close} />}
    </>
  )
}

/** Cover clone that flies from `from` to `to`, then fades out over the real image. Returns a disposer. */
function flyCover(from: CoverOrigin, to: DOMRect): () => void {
  const img = document.createElement('img')
  img.alt = ''
  img.setAttribute('aria-hidden', 'true')
  img.src = from.src
  Object.assign(img.style, {
    position: 'fixed',
    left: `${from.rect.left}px`,
    top: `${from.rect.top}px`,
    width: `${from.rect.width}px`,
    height: `${from.rect.height}px`,
    objectFit: 'cover',
    pointerEvents: 'none',
    zIndex: '60', // above .modal-backdrop (50)
    borderRadius: '6px',
    margin: '0',
  })
  document.body.appendChild(img)

  const tl = gsap.timeline({ onComplete: dispose })
  tl.to(img, { left: to.left, top: to.top, width: to.width, height: to.height, borderRadius: 0, duration: 0.55, ease: 'power3.inOut' })
  tl.to(img, { opacity: 0, duration: 0.25, ease: 'power1.out' })
  img.addEventListener('error', dispose)

  function dispose() {
    tl.kill()
    img.remove()
  }
  return dispose
}

export function ProjectModal({ project, onClose }: Props) {
  const { lang } = useAppState()
  const reduce = useReducedMotion()
  const titleId = useId()
  const panel = useRef<HTMLDivElement>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)
  const [noBackdrop, setNoBackdrop] = useState(false)

  // Taken once per mount: the origin is single-use, and StrictMode runs the effect twice.
  const origin = useRef<CoverOrigin | null | undefined>(undefined)
  const disposeFlight = useRef<(() => void) | null>(null)

  // Entrance only: the dialog rises and settles. Reduced motion shows it in place at once.
  useGSAP(
    () => {
      if (reduce || !panel.current) return
      if (origin.current === undefined) origin.current = takeCoverOrigin()
      // Measured before the panel's own entrance moves it, so the clone lands where the cover really settles.
      const target = (panel.current.querySelector('.modal-cover') ?? panel.current).getBoundingClientRect()
      const from = origin.current
      gsap.from(panel.current, { opacity: 0, scale: 0.94, y: 24, duration: 0.35, ease: 'power2.out', clearProps: 'transform,opacity' })
      if (from && target.width > 0 && target.height > 0) {
        disposeFlight.current?.()
        disposeFlight.current = flyCover(from, target)
      }
      return () => disposeFlight.current?.()
    },
    { dependencies: [reduce] },
  )
  // another project opened in place: drop a flight that belongs to the previous one
  useEffect(() => () => disposeFlight.current?.(), [project.id])

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    closeBtn.current?.focus()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
      if (opener && opener !== document.body && opener.isConnected) opener.focus()
    }
  }, [onClose])

  const trapTab = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab' || !panel.current) return
    const items = [...panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)]
    if (!items.length) return
    const first = items[0]
    const last = items[items.length - 1]
    const active = document.activeElement
    // Focus on the dialog itself (after clicking plain text) counts as "outside the controls".
    const outside = !active || active === panel.current || !items.includes(active as HTMLElement)
    if (e.shiftKey && (active === first || outside)) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && (active === last || outside)) {
      e.preventDefault()
      first.focus()
    }
  }

  return (
    <div
      className="modal-backdrop"
      role="presentation" // mouse-only convenience; keyboard users close with Esc or the button
      data-testid="modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* the dialog itself keeps Tab inside it (focus trap); that key handler is the accessible pattern, not a fake control */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <div
        ref={panel}
        className="modal"
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        data-lenis-prevent // the dialog scrolls itself; Lenis must not hijack the wheel
        aria-labelledby={titleId}
        onKeyDown={trapTab}
      >
        {/* sticky so the close button stays reachable on phones, where there is no Esc key */}
        <div className="modal-close-bar">
          <button ref={closeBtn} type="button" className="modal-close roll-host" data-magnetic="0.3" onClick={onClose}>
            <RollText>{t('modal.close', lang)}</RollText>
          </button>
        </div>

        {!noBackdrop && (
          <img className="modal-cover" src={asset(project.fundo)} alt="" onError={() => setNoBackdrop(true)} />
        )}

        <div className="modal-body">
          <h2 id={titleId}>{project.titulo[lang]}</h2>
          <p className="modal-status">{statusLabel(project.status, lang)}</p>
          <p>{project.resumo[lang]}</p>

          {project.links?.length ? (
            <ul className="actions" role="list">
              {project.links.map((l) => (
                <li key={l.url}>
                  {/^https?:/i.test(l.url) ? (
                    <a className={l.label === 'Site' ? 'action action--primary roll-host' : 'action roll-host'} data-magnetic="0.3" href={l.url} target="_blank" rel="noopener noreferrer">
                      <RollText>{linkLabel(l.label, lang)}</RollText>
                      <span className="sr-only"> ({t('link.newTab', lang)})</span>
                      <ExternalIcon />
                    </a>
                  ) : (
                    // a file published with the site: downloads in place instead of opening another page
                    <a className="action action--primary roll-host" data-magnetic="0.3" href={asset(l.url)} download>
                      <RollText>{linkLabel(l.label, lang)}</RollText>
                      <DownloadIcon />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          ) : null}

          <h3>{t('modal.purpose', lang)}</h3>
          <p>{project.proposito[lang]}</p>

          {project.funcionalidades?.length ? (
            <>
              <h3>{t('modal.features', lang)}</h3>
              <ul className="features">
                {project.funcionalidades.map((f, i) => (
                  <li key={`${i}-${f.pt}`}>{f[lang]}</li>
                ))}
              </ul>
            </>
          ) : null}

          {project.comoFunciona?.length ? (
            <>
              <h3>{t('modal.how', lang)}</h3>
              <ol className="steps">
                {project.comoFunciona.map((s, i) => (
                  <li key={`${i}-${s.pt}`}>{s[lang]}</li>
                ))}
              </ol>
            </>
          ) : null}

          {project.ferramentas?.length ? (
            <>
              <h3>{t('modal.tools', lang)}</h3>
              <dl className="tool-groups">
                {project.ferramentas.map((g) => (
                  <div key={g.grupo.pt}>
                    <dt>{g.grupo[lang]}</dt>
                    <dd>{g.itens.join(', ')}</dd>
                  </div>
                ))}
              </dl>
            </>
          ) : null}

          {project.metodologia?.length ? (
            <>
              <h3>{t('modal.methods', lang)}</h3>
              <ul className="features">
                {project.metodologia.map((m, i) => (
                  <li key={`${i}-${m.pt}`}>{m[lang]}</li>
                ))}
              </ul>
            </>
          ) : null}

          <h3>{t('modal.role', lang)}</h3>
          <p>{project.papel[lang]}</p>

          {project.desafios && (
            <>
              <h3>{t('modal.challenges', lang)}</h3>
              <p>{project.desafios[lang]}</p>
            </>
          )}

          {project.galeria?.length ? <Gallery items={project.galeria} lang={lang} /> : null}

          <h3>{t('modal.stack', lang)}</h3>
          <ul className="tags" role="list">
            {project.stack.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>

          {/* keyed by project: a hash change to another project must not keep the previous demo started */}
          <Demo key={project.id} project={project} lang={lang} />
        </div>
      </div>
    </div>
  )
}
