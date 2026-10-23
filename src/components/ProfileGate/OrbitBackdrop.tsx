import { lazy, Suspense, useMemo } from 'react'
import { hasWebGL } from '../../lib/hasWebGL'
import { useReducedMotion } from '../../lib/useReducedMotion'
import { CanvasBoundary } from '../CanvasBoundary'
import './OrbitBackdrop.css'

// three.js lives in its own chunk, fetched only when the gate actually renders the scene
const OrbitScene = lazy(() => import('../../scenes/OrbitScene'))

function Fallback() {
  return <div className="orbit-fallback" data-testid="orbit-fallback" aria-hidden="true" />
}

export function OrbitBackdrop({ covers }: { covers: string[] }) {
  const reduce = useReducedMotion()
  const supported = useMemo(() => !reduce && covers.length > 0 && hasWebGL(), [reduce, covers.length])

  if (!supported) return <Fallback />
  return (
    <div className="orbit" aria-hidden="true">
      <CanvasBoundary fallback={<Fallback />}>
        <Suspense fallback={<Fallback />}>
          <OrbitScene covers={covers} />
        </Suspense>
      </CanvasBoundary>
    </div>
  )
}
