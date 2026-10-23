import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { motion } from 'motion/react'
import type { Project } from '../../lib/types'
import { asset } from '../../lib/assets'
import { statusLabel, t } from '../../lib/i18n'
import { useReducedMotion } from '../../lib/useReducedMotion'
import { useAppState } from '../../state/AppState'
import './ProjectModal.css'

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

type Props = { project: Project; onClose: () => void }

export function ProjectModal({ project, onClose }: Props) {
  const { lang } = useAppState()
  const reduce = useReducedMotion()
  const titleId = useId()
  const panel = useRef<HTMLDivElement>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)
  const [noBackdrop, setNoBackdrop] = useState(false)

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
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
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
      <motion.div
        ref={panel}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={trapTab}
        initial={reduce ? false : { opacity: 0, scale: 0.94, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: reduce ? 0 : 0.35, ease: 'easeOut' }}
      >
        <button ref={closeBtn} type="button" className="modal-close" onClick={onClose}>
          {t('modal.close', lang)}
        </button>

        {!noBackdrop && (
          <img className="modal-cover" src={asset(project.fundo)} alt="" onError={() => setNoBackdrop(true)} />
        )}

        <div className="modal-body">
          <h2 id={titleId}>{project.titulo[lang]}</h2>
          <p className="modal-status">{statusLabel(project.status, lang)}</p>
          <p>{project.resumo[lang]}</p>

          <h3>{t('modal.purpose', lang)}</h3>
          <p>{project.proposito[lang]}</p>

          <h3>{t('modal.role', lang)}</h3>
          <p>{project.papel[lang]}</p>

          <h3>{t('modal.stack', lang)}</h3>
          <ul className="tags">
            {project.stack.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>

          {project.links && (
            <>
              <h3>{t('modal.links', lang)}</h3>
              <ul className="links">
                {project.links.map((l) => (
                  <li key={l.url}>
                    <a href={l.url} target="_blank" rel="noopener noreferrer">
                      {l.label} <span aria-hidden="true">↗</span>
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
