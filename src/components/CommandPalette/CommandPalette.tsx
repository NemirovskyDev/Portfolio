import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { gsap, useGSAP } from '../../lib/gsap'
import { t } from '../../lib/i18n'
import { SKILL_GROUPS } from '../../lib/skills'
import type { Lang, Project } from '../../lib/types'
import { useAppState } from '../../state/AppState'
import './CommandPalette.css'

export type SectionId = 'inicio' | 'sobre' | 'projetos' | 'contato'

type Props = {
  open: boolean
  projects: Project[]
  onClose: () => void
  onPickSection: (id: SectionId) => void
  onPickProject: (id: string) => void
  onPickSkill: (skillId: string) => void
}

type Group = 'sections' | 'projects' | 'skills'
type Item = { key: string; group: Group; label: string; hint?: string; haystack: string; run: () => void }

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
const GROUPS: Group[] = ['sections', 'projects', 'skills']

/** Lowercase and accent-free, so "orquestracao" finds "Orquestração". */
const fold = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

const SECTIONS: { id: SectionId; label: (lang: Lang) => string }[] = [
  { id: 'inicio', label: (lang) => (lang === 'pt' ? 'Início' : 'Top') },
  { id: 'sobre', label: (lang) => t('nav.about', lang) },
  { id: 'projetos', label: (lang) => t('nav.projects', lang) },
  { id: 'contato', label: (lang) => t('nav.contact', lang) },
]

type Picks = Pick<Props, 'onPickSection' | 'onPickProject' | 'onPickSkill'>

function buildItems(projects: Project[], lang: Lang, pick: Picks): Item[] {
  const sections = SECTIONS.map(({ id, label }) => ({
    key: `s:${id}`,
    group: 'sections' as const,
    label: label(lang),
    haystack: fold(`${label('pt')} ${label('en')}`),
    run: () => pick.onPickSection(id),
  }))
  const projs = projects.map((p) => ({
    key: `p:${p.id}`,
    group: 'projects' as const,
    label: p.titulo[lang],
    hint: p.categoria,
    // also matches the tools a project used, so "gsap" or "react" lists the projects built with them
    haystack: fold([p.titulo.pt, p.titulo.en, p.categoria, ...p.stack, ...(p.ferramentas ?? []).flatMap((f) => f.itens)].join(' ')),
    run: () => pick.onPickProject(p.id),
  }))
  const skills = SKILL_GROUPS.flatMap((g) =>
    g.itens.map((it) => ({
      key: `k:${it.id}`,
      group: 'skills' as const,
      label: it[lang],
      hint: g.grupo[lang],
      haystack: fold(`${it.pt} ${it.en} ${g.grupo[lang]}`),
      run: () => pick.onPickSkill(it.id),
    })),
  )
  return [...sections, ...projs, ...skills]
}

/** Ctrl/⌘+K palette: jump to a section, open a project or go to a skill. Combobox + listbox pattern. */
export function CommandPalette({ open, projects, onClose, onPickSection, onPickProject, onPickSkill }: Props) {
  const { lang } = useAppState()
  const uid = useId()
  const titleId = `${uid}-title`
  const listId = `${uid}-list`
  const panel = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  // The parent may pass a new onClose every render; a ref keeps the effect from re-running (and stealing focus).
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  })

  const items = useMemo(
    () => buildItems(projects, lang, { onPickSection, onPickProject, onPickSkill }),
    [projects, lang, onPickSection, onPickProject, onPickSkill],
  )
  // Options in on-screen order (grouped), so the arrow keys follow what the eye sees.
  const ordered = useMemo(() => {
    const terms = fold(query).split(/\s+/).filter(Boolean)
    const hits = items.filter((i) => terms.every((w) => i.haystack.includes(w)))
    return GROUPS.flatMap((g) => hits.filter((i) => i.group === g))
  }, [items, query])
  const current = Math.min(active, Math.max(ordered.length - 1, 0))
  const optionId = (i: number) => `${uid}-opt-${i}`

  useEffect(() => {
    if (!open) return
    const opener = document.activeElement as HTMLElement | null
    input.current?.focus()
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

  useEffect(() => {
    if (open) document.getElementById(`${uid}-opt-${current}`)?.scrollIntoView?.({ block: 'nearest' })
  }, [open, current, uid])

  useGSAP(
    () => {
      if (!open || !panel.current) return
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from(panel.current, { opacity: 0, y: 16, scale: 0.98, duration: 0.25, ease: 'power3.out' })
      })
    },
    { dependencies: [open] },
  )

  if (!open) return null

  const choose = (item?: Item) => {
    if (!item) return
    item.run()
    onClose()
  }

  const onInputKey = (e: KeyboardEvent<HTMLInputElement>) => {
    const last = ordered.length - 1
    const go = (i: number) => {
      e.preventDefault()
      setActive(i)
    }
    if (e.key === 'ArrowDown') go(current >= last ? 0 : current + 1)
    else if (e.key === 'ArrowUp') go(current <= 0 ? last : current - 1)
    else if (e.key === 'Home') go(0)
    else if (e.key === 'End') go(last)
    else if (e.key === 'Enter') {
      e.preventDefault()
      choose(ordered[current])
    }
  }

  const trapTab = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab' || !panel.current) return
    const stops = [...panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)]
    if (!stops.length) return
    const first = stops[0]
    const lastStop = stops[stops.length - 1]
    const a = document.activeElement
    if (e.shiftKey && a === first) {
      e.preventDefault()
      lastStop.focus()
    } else if (!e.shiftKey && a === lastStop) {
      e.preventDefault()
      first.focus()
    }
  }

  const status = ordered.length ? t('palette.results', lang).replace('{n}', String(ordered.length)) : t('palette.empty', lang)
  let n = -1 // running option index across groups

  return (
    <div
      className="palette-backdrop"
      role="presentation" // mouse-only convenience; keyboard users close with Esc
      data-testid="palette-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={trapTab}
    >
      <div ref={panel} className="palette-panel" role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} data-lenis-prevent>
        <h2 id={titleId} className="palette-title">
          {t('palette.title', lang)}
        </h2>
        <div className="palette-field">
          <input
            ref={input}
            className="palette-input"
            type="text"
            role="combobox"
            aria-expanded={ordered.length > 0}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={ordered.length ? optionId(current) : undefined}
            aria-label={t('palette.placeholder', lang)}
            placeholder={t('palette.placeholder', lang)}
            autoComplete="off"
            spellCheck={false}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActive(0)
            }}
            onKeyDown={onInputKey}
          />
          <button type="button" className="palette-close" onClick={onClose}>
            {t('palette.close', lang)}
          </button>
        </div>
        <ul id={listId} className="palette-list" role="listbox" aria-label={t('palette.title', lang)}>
          {GROUPS.map((g) => {
            const rows = ordered.filter((i) => i.group === g)
            if (!rows.length) return null
            const label = t(`palette.group.${g}`, lang)
            return (
              <li key={g} role="presentation">
                <div className="palette-group" role="presentation">
                  {label}
                </div>
                <ul role="group" aria-label={label} className="palette-rows">
                  {rows.map((item) => {
                    const idx = ++n
                    return (
                      // keyboard use goes through the combobox input (aria-activedescendant), not the options
                      // eslint-disable-next-line jsx-a11y/click-events-have-key-events
                      <li
                        key={item.key}
                        id={optionId(idx)}
                        role="option"
                        aria-selected={idx === current}
                        className="palette-option"
                        onMouseDown={(e) => e.preventDefault()} // keep focus in the input
                        onMouseMove={() => idx !== current && setActive(idx)}
                        onClick={() => choose(item)}
                      >
                        <span>{item.label}</span>
                        {item.hint && <span className="palette-hint">{item.hint}</span>}
                      </li>
                    )
                  })}
                </ul>
              </li>
            )
          })}
        </ul>
        <p className="palette-status" role="status" aria-live="polite">
          {status}
        </p>
        <p className="palette-keys">{t('palette.hint', lang)}</p>
      </div>
    </div>
  )
}
