import { useEffect, useRef } from 'react'
import Lenis from 'lenis'

type Options = { enabled: boolean; paused: boolean }

/**
 * Inertia scrolling. Off when disabled (reduced motion). Paused while a modal owns the scroll:
 * body overflow:hidden alone is not enough, because Lenis would keep animating the window underneath.
 */
export function useSmoothScroll({ enabled, paused }: Options): void {
  const lenis = useRef<Lenis | null>(null)

  useEffect(() => {
    if (!enabled) return
    const instance = new Lenis({ autoRaf: true })
    lenis.current = instance
    return () => {
      instance.destroy()
      lenis.current = null
    }
  }, [enabled])

  // Declared after the creating effect so a Lenis mounted already paused is stopped at once.
  useEffect(() => {
    const instance = lenis.current
    if (!instance) return
    if (!paused) return
    instance.stop()
    return () => {
      // skip when the instance was destroyed in the same commit
      if (lenis.current === instance) instance.start()
    }
  }, [paused, enabled])
}
