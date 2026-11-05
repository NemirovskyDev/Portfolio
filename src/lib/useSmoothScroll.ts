import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from './gsap'

type Options = { enabled: boolean; paused: boolean }

// The live instance, so in-page links can glide with the same inertia instead of jumping.
let active: Lenis | null = null

/** Scrolls to an element or a y position: smoothly through Lenis when it runs, natively otherwise. */
export function scrollToTarget(target: HTMLElement | number): void {
  if (active) {
    active.scrollTo(target)
    return
  }
  const top = typeof target === 'number' ? target : target.getBoundingClientRect().top + window.scrollY
  window.scrollTo({ top, behavior: 'auto' })
}

/**
 * Inertia scrolling. Off when disabled (reduced motion). Paused while a modal owns the scroll:
 * body overflow:hidden alone is not enough, because Lenis would keep animating the window underneath.
 * Lenis runs on GSAP's ticker and reports every scroll to ScrollTrigger, so both share one frame clock.
 */
export function useSmoothScroll({ enabled, paused }: Options): void {
  const lenis = useRef<Lenis | null>(null)

  useEffect(() => {
    if (!enabled) return
    const instance = new Lenis({ autoRaf: false })
    const tick = (time: number) => instance.raf(time * 1000) // the ticker gives seconds, Lenis wants ms
    instance.on('scroll', ScrollTrigger.update)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0) // a long frame must not make the scroll jump behind the finger
    lenis.current = instance
    active = instance
    return () => {
      gsap.ticker.remove(tick)
      instance.destroy()
      lenis.current = null
      if (active === instance) active = null
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
