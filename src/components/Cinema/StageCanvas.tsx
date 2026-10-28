import { lazy, Suspense, useMemo, type ReactNode } from 'react'
import type { MotionValue } from 'motion/react'
import { hasWebGL } from '../../lib/hasWebGL'
import { useReducedMotion } from '../../lib/useReducedMotion'
import { CanvasBoundary } from '../CanvasBoundary'
import './StageCanvas.css'

// three.js lives in its own chunk, fetched only when the stage actually renders the scene
const ShelfScene = lazy(() => import('../../scenes/ShelfScene'))

type Props = { covers: string[]; backdrops: string[]; progress: MotionValue<number>; fallback: ReactNode }

/** Decorative 3D shelf. Any reason it cannot run (no WebGL, reduced motion, no covers, scene error) shows `fallback`. */
export function StageCanvas({ covers, backdrops, progress, fallback }: Props) {
  const reduce = useReducedMotion()
  const supported = useMemo(() => !reduce && covers.length > 0 && hasWebGL(), [reduce, covers.length])

  if (!supported) return <>{fallback}</>
  return (
    <div className="stage-canvas" aria-hidden="true">
      <CanvasBoundary fallback={fallback}>
        <Suspense fallback={fallback}>
          <ShelfScene covers={covers} backdrops={backdrops} progress={progress} />
        </Suspense>
      </CanvasBoundary>
    </div>
  )
}
