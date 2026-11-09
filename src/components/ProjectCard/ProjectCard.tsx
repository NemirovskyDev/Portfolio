import { useState, type MouseEvent, type PointerEvent } from 'react'
import type { Project } from '../../lib/types'
import { asset } from '../../lib/assets'
import { setCoverOrigin } from '../../lib/coverOrigin'
import { useReducedMotion } from '../../lib/useReducedMotion'
import { useAppState } from '../../state/AppState'
import './ProjectCard.css'

const MAX_TILT = 14 // degrees

type Props = { project: Project; onOpen: (id: string) => void }

export function ProjectCard({ project, onOpen }: Props) {
  const { lang } = useAppState()
  const reduce = useReducedMotion()
  const [broken, setBroken] = useState(false)
  const title = project.titulo[lang]

  const tilt = (e: PointerEvent<HTMLButtonElement>) => {
    const el = e.currentTarget
    const r = el.getBoundingClientRect()
    if (!r.width || !r.height) return
    const nx = (e.clientX - r.left) / r.width - 0.5
    const ny = (e.clientY - r.top) / r.height - 0.5
    el.style.setProperty('--ry', `${(nx * MAX_TILT).toFixed(2)}deg`)
    el.style.setProperty('--rx', `${(-ny * MAX_TILT).toFixed(2)}deg`)
  }
  const reset = (e: PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.style.setProperty('--ry', '0deg')
    e.currentTarget.style.setProperty('--rx', '0deg')
  }

  const open = (e: MouseEvent<HTMLButtonElement>) => {
    const img = e.currentTarget.querySelector('img')
    if (img) {
      const { left, top, width, height } = img.getBoundingClientRect()
      if (width > 0 && height > 0) setCoverOrigin({ rect: { left, top, width, height }, src: img.currentSrc || img.src })
    }
    onOpen(project.id)
  }

  return (
    <button
      type="button"
      className="card"
      onClick={open}
      onPointerMove={reduce ? undefined : tilt}
      onPointerLeave={reduce ? undefined : reset}
    >
      {broken ? (
        <span className="card-placeholder" data-testid="card-placeholder" aria-hidden="true">
          <span className="clamp-2">{title}</span>
        </span>
      ) : (
        <img src={asset(project.capa)} alt="" loading="lazy" onError={() => setBroken(true)} />
      )}
      <span className="card-caption">
        <span className="card-title clamp-2">{title}</span>
      </span>
    </button>
  )
}
