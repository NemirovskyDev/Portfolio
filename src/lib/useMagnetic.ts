import { useEffect } from 'react'
import { gsap } from './gsap'

const SELECTOR = '[data-magnetic]'
const DEFAULT_STRENGTH = 0.3
// Light pulls (timeline markers) stay within ~12px so they never fight the click target; stronger ones may travel further.
const MAX_LIGHT = 12
const MAX_STRONG = 24

type Pull = { x: (v: number) => void; y: (v: number) => void }

const clamp = (v: number, max: number) => Math.max(-max, Math.min(max, v))

/** Elements marked `data-magnetic="<strength>"` lean toward the cursor and spring back on leave. One delegated listener, fine pointers only. */
export function useMagnetic(): void {
  useEffect(() => {
    const mm = gsap.matchMedia()
    mm.add('(pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
      const pulls = new Map<HTMLElement, Pull>()
      let current: HTMLElement | null = null

      const release = (el: HTMLElement) => {
        gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.5)', overwrite: 'auto' })
        pulls.delete(el)
      }

      const onMove = (e: PointerEvent) => {
        const el = e.target instanceof Element ? e.target.closest<HTMLElement>(SELECTOR) : null
        if (current && current !== el) release(current)
        current = el
        if (!el) return
        const strength = Number(el.dataset.magnetic) || DEFAULT_STRENGTH
        const max = strength <= 0.2 ? MAX_LIGHT : MAX_STRONG
        const r = el.getBoundingClientRect()
        // the element is already displaced, so subtract its current offset to measure from its rest position
        const dx = e.clientX - (r.left + r.width / 2 - (Number(gsap.getProperty(el, 'x')) || 0))
        const dy = e.clientY - (r.top + r.height / 2 - (Number(gsap.getProperty(el, 'y')) || 0))
        let pull = pulls.get(el)
        if (!pull) {
          pull = {
            x: gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' }),
            y: gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' }),
          }
          pulls.set(el, pull)
        }
        pull.x(clamp(dx * strength, max))
        pull.y(clamp(dy * strength, max))
      }

      const onLeave = () => {
        if (current) release(current)
        current = null
      }

      document.addEventListener('pointermove', onMove)
      document.addEventListener('pointerleave', onLeave)
      return () => {
        document.removeEventListener('pointermove', onMove)
        document.removeEventListener('pointerleave', onLeave)
        const els = new Set<HTMLElement>([...pulls.keys(), ...(current ? [current] : [])])
        els.forEach((el) => gsap.set(el, { clearProps: 'x,y' }))
        pulls.clear()
      }
    })
    return () => mm.revert()
  }, [])
}
