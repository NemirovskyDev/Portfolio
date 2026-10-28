import { useEffect, useId, useRef, type KeyboardEvent } from 'react'
import type { Project } from '../../lib/types'
import { t } from '../../lib/i18n'
import { useAppState } from '../../state/AppState'
import { ProjectCard } from '../ProjectCard/ProjectCard'
import './IndexPanel.css'

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

type Props = { open: boolean; projects: Project[]; onClose: () => void; onOpenProject: (id: string) => void }

export function IndexPanel({ open, projects, onClose, onOpenProject }: Props) {
  const { lang } = useAppState()
  const titleId = useId()
  const panel = useRef<HTMLDivElement>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)
  // The parent may pass a new onClose every render; a ref keeps the effect from re-running (and stealing focus).
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    if (!open) return
    const opener = document.activeElement as HTMLElement | null
    closeBtn.current?.focus()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
      if (opener && opener !== document.body && opener.isConnected) opener.focus()
    }
  }, [open])

  if (!open) return null

  const trapTab = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab' || !panel.current) return
    const items = [...panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)]
    if (!items.length) return
    const first = items[0]
    const last = items[items.length - 1]
    const active = document.activeElement
    const outside = !active || active === panel.current || !items.includes(active as HTMLElement)
    if (e.shiftKey && (active === first || outside)) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && (active === last || outside)) {
      e.preventDefault()
      first.focus()
    }
  }

  const choose = (id: string) => {
    onOpenProject(id)
    onClose()
  }

  return (
    <div
      className="index-backdrop"
      role="presentation" // mouse-only convenience; keyboard users close with Esc or the button
      data-testid="index-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={trapTab} // bubbles up from the dialog
    >
      <div
        ref={panel}
        className="index-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        data-lenis-prevent // the panel scrolls itself; Lenis must not hijack the wheel
      >
        <div className="index-head">
          <h2 id={titleId} className="index-title">
            {t('index.title', lang)}
          </h2>
          <button ref={closeBtn} type="button" className="index-close" onClick={onClose}>
            {t('index.close', lang)}
          </button>
        </div>
        <ul className="index-grid" role="list">
          {projects.map((p) => (
            <li key={p.id}>
              <ProjectCard project={p} onOpen={choose} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
