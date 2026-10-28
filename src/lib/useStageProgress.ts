import type { RefObject } from 'react'
import { useScroll, useTransform, type MotionValue } from 'motion/react'

/** Scroll progress of the tall stage, mapped to chapter space 0 .. count-1 (the single `f`). */
export function useStageProgress(ref: RefObject<HTMLElement | null>, count: number): MotionValue<number> {
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  // [0, 0] would be a degenerate range, so fewer than two chapters pin f to 0.
  return useTransform(scrollYProgress, [0, 1], [0, Math.max(count - 1, 0)])
}
