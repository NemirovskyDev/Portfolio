import { useEffect, useRef, useState } from 'react'
import { animate } from 'motion/react'
import { morphLayout } from '../../lib/morphLayout'
import { useReducedMotion } from '../../lib/useReducedMotion'
import './MorphTransition.css'

const DURATION = 1.5 // seconds

type Props = { covers: string[]; onDone: () => void }

/** Covers go from scattered to a circle to an arc, then the overlay fades out over the home. */
export function MorphTransition({ covers, onDone }: Props) {
  const reduce = useReducedMotion()
  const skip = reduce || covers.length === 0
  const [t, setT] = useState(0)
  const done = useRef(onDone)

  useEffect(() => {
    done.current = onDone
  })

  useEffect(() => {
    if (skip) {
      done.current()
      return
    }
    const controls = animate(0, 1, { duration: DURATION, ease: 'easeInOut', onUpdate: setT, onComplete: () => done.current() })
    return () => controls.stop()
  }, [skip])

  if (skip) return null

  const fade = Math.min(1, Math.max(0, (t - 0.85) / 0.15))
  return (
    <div className="morph" data-testid="morph" aria-hidden="true" style={{ opacity: 1 - fade }}>
      {morphLayout(covers.length, t).map((p, i) => (
        <div
          key={`${covers[i]}-${i}`}
          className="morph-tile"
          style={{ transform: `translate(-50%, -50%) translate(calc(var(--u) * ${p.x}), calc(var(--u) * ${p.y})) rotate(${p.rotate}deg)` }}
        >
          <img src={covers[i]} alt="" onError={(e) => (e.currentTarget.style.visibility = 'hidden')} />
        </div>
      ))}
    </div>
  )
}
