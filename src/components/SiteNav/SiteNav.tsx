import { useEffect, useRef, useState } from 'react'
import { t } from '../../lib/i18n'
import { scrollToTarget } from '../../lib/useSmoothScroll'
import { useAppState } from '../../state/AppState'
import './SiteNav.css'

const ITEMS = [
  { id: 'sobre', key: 'nav.about' },
  { id: 'projetos', key: 'nav.projects' },
  { id: 'contato', key: 'nav.contact' },
] as const

/** In-page links in the top bar. On narrow screens they fold into a menu button. */
export function SiteNav() {
  const { lang } = useAppState()
  const [open, setOpen] = useState(false)
  const toggle = useRef<HTMLButtonElement>(null)
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        toggle.current?.focus()
      }
    }
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onDown)
    }
  }, [open])

  const go = (id: string) => {
    setOpen(false)
    const el = document.getElementById(id)
    if (el) scrollToTarget(el)
  }

  return (
    <nav ref={root} className="sitenav" aria-label={t('nav.label', lang)}>
      <button
        ref={toggle}
        type="button"
        className="sitenav-toggle topbar-btn"
        aria-expanded={open}
        aria-controls="sitenav-list"
        onClick={() => setOpen((v) => !v)}
      >
        {t('nav.menu', lang)}
      </button>
      <ul id="sitenav-list" className={open ? 'sitenav-list sitenav-list--open' : 'sitenav-list'} role="list">
        {ITEMS.map((it) => (
          <li key={it.id}>
            <button type="button" className="sitenav-link" onClick={() => go(it.id)}>
              {t(it.key, lang)}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
