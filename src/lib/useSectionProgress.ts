import { useLayoutEffect, useState, type RefObject } from 'react'
import { ScrollTrigger } from './gsap'
import { createProgress, type Progress } from './progress'

/** 0 when the section's top meets the viewport top, 1 when its bottom leaves the top of the viewport. */
export function useSectionProgress(ref: RefObject<HTMLElement | null>): Progress {
  const [progress] = useState(() => createProgress(0))
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom top',
      onUpdate: (self) => progress.set(self.progress),
    })
    return () => trigger.kill()
  }, [ref, progress])
  return progress
}
