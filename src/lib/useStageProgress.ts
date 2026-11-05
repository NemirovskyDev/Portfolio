import { useLayoutEffect, useState, type RefObject } from 'react'
import { ScrollTrigger } from './gsap'
import { createProgress, type Progress } from './progress'

/** Scroll progress of the tall stage, mapped to chapter space 0 .. count-1 (the single `f`). */
export function useStageProgress(ref: RefObject<HTMLElement | null>, count: number): Progress {
  const [progress] = useState(() => createProgress(0))
  // fewer than two chapters have nothing to travel between, so f stays at 0
  const span = Math.max(count - 1, 0)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => progress.set(self.progress * span),
      onRefresh: (self) => progress.set(self.progress * span),
    })
    progress.set(trigger.progress * span)
    return () => trigger.kill()
  }, [ref, span, progress])

  return progress
}
