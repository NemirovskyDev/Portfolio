import { lazy, Suspense, useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'
import type { Progress } from '../../lib/progress'
import type { FluidColors } from '../../lib/palette'
import { CanvasBoundary } from '../CanvasBoundary'
import './FluidBackdrop.css'

// three.js stays in its own chunk; the still gradient paints first, so the hero never waits on it
const FluidScene = lazy(() => import('../../scenes/FluidScene'))

type Props = {
  colors: FluidColors
  /** 1 for the hero, lower for quieter sections. */
  intensity?: number
  /** false renders only the still gradient (reduced motion, no WebGL, weak device). */
  live: boolean
  scroll?: Progress
}

/** Renders only while the section is on screen and the tab is visible, so two of these never run at once. */
function useOnScreen(ref: RefObject<HTMLElement | null>): boolean {
  const [onScreen, setOnScreen] = useState(false)
  const [tabVisible, setTabVisible] = useState(() => document.visibilityState !== 'hidden')
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting))
    io.observe(el)
    const onVis = () => setTabVisible(document.visibilityState !== 'hidden')
    document.addEventListener('visibilitychange', onVis)
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [ref])
  return onScreen && tabVisible
}

/** Decorative living gradient behind a section. Always has the still version underneath as its fallback. */
export function FluidBackdrop({ colors, intensity = 1, live, scroll }: Props) {
  const root = useRef<HTMLDivElement>(null)
  const running = useOnScreen(root)
  // the still version uses the same colours, so the swap to the live field is a soft change, not a flash
  const still = {
    '--fluid-base': colors.base,
    '--fluid-c1': colors.c1,
    '--fluid-c2': colors.c2,
    '--fluid-c3': colors.c3,
    '--fluid-strength': `${Math.round(intensity * 100)}%`,
  } as CSSProperties

  return (
    <div ref={root} className="fluid" style={still} aria-hidden="true">
      <div className="fluid-still" />
      {live && (
        <CanvasBoundary fallback={null}>
          <Suspense fallback={null}>
            <div className="fluid-live">
              <FluidScene colors={colors} intensity={intensity} scroll={scroll} running={running} />
            </div>
          </Suspense>
        </CanvasBoundary>
      )}
      <div className="fluid-grain" />
    </div>
  )
}
