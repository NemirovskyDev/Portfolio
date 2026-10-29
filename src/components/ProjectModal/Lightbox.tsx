import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import type { Lang, Project } from '../../lib/types'
import { asset } from '../../lib/assets'
import { t } from '../../lib/i18n'
import { useReducedMotion } from '../../lib/useReducedMotion'
import './Lightbox.css'

type Item = NonNullable<Project['galeria']>[number]
type Props = { items: Item[]; index: number; lang: Lang; onIndex: (i: number) => void; onClose: () => void }

const FOCUSABLE = 'button:not([disabled])'

/** A print enlarged in the middle of the screen over a blurred page. It sits above the project dialog. */
export function Lightbox({ items, index, lang, onIndex, onClose }: Props) {
  const reduce = useReducedMotion()
  const root = useRef<HTMLDivElement>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)
  const item = items[index]
  const many = items.length > 1

  // Latest values for the key handler, which is registered once so focus is not reset on every print.
  const latest = useRef({ index, count: items.length, onIndex, onClose })
  useEffect(() => {
    latest.current = { index, count: items.length, onIndex, onClose }
  })

  useEffect(() => {
    closeBtn.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      const { index: i, count, onIndex: go, onClose: close } = latest.current
      if (e.key === 'Tab' && root.current) {
        const controls = [...root.current.querySelectorAll<HTMLElement>(FOCUSABLE)]
        const first = controls[0]
        const last = controls[controls.length - 1]
        const active = document.activeElement
        if (e.shiftKey && active === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && active === last) {
          e.preventDefault()
          first.focus()
        }
        return
      }
      if (e.key === 'Escape') close()
      else if (e.key === 'ArrowRight' && count > 1) go((i + 1) % count)
      else if (e.key === 'ArrowLeft' && count > 1) go((i - 1 + count) % count)
      else return
      // the project dialog listens for Esc on the same document; this print must close first and alone
      e.stopImmediatePropagation()
      e.preventDefault()
    }
    document.addEventListener('keydown', onKey, true)
    return () => document.removeEventListener('keydown', onKey, true)
  }, [])

  if (!item) return null
  const label = item.alt[lang]

  return (
    <div className="lightbox" role="presentation" data-testid="lightbox-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div
        ref={root}
        className="lightbox-panel"
        role="dialog"
        aria-modal="true"
        aria-label={label}
        data-lenis-prevent
        initial={reduce ? false : { opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: reduce ? 0 : 0.28, ease: 'easeOut' }}
      >
        <button ref={closeBtn} type="button" className="lightbox-close" onClick={onClose}>
          {t('modal.close', lang)}
        </button>
        <img key={item.src} className="lightbox-img" src={asset(item.src)} alt={label} />
        <p className="lightbox-caption">
          <span className="lightbox-count" aria-live="polite">
            {index + 1} / {items.length}
          </span>
          {label}
        </p>
        {many && (
          <>
            <button type="button" className="lightbox-nav lightbox-prev" onClick={() => onIndex((index - 1 + items.length) % items.length)}>
              <span className="sr-only">{t('lightbox.prev', lang)}</span>
              <span aria-hidden="true">‹</span>
            </button>
            <button type="button" className="lightbox-nav lightbox-next" onClick={() => onIndex((index + 1) % items.length)}>
              <span className="sr-only">{t('lightbox.next', lang)}</span>
              <span aria-hidden="true">›</span>
            </button>
          </>
        )}
      </motion.div>
    </div>
  )
}
