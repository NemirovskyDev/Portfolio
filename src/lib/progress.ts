import { useLayoutEffect, useRef } from 'react'

/** A number that changes outside React (scroll position) and tells listeners, without re-rendering anyone. */
export type Progress = {
  get(): number
  set(value: number): void
  subscribe(listener: (value: number) => void): () => void
}

export function createProgress(initial = 0): Progress {
  let value = Number.isFinite(initial) ? initial : 0
  const listeners = new Set<(value: number) => void>()
  return {
    get: () => value,
    set(next) {
      // a NaN from a zero-height trigger must not reach styles or the 3D scene
      if (!Number.isFinite(next) || next === value) return
      value = next
      listeners.forEach((l) => l(value))
    },
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}

/**
 * Runs `apply` now and on every change of `progress`. Layout effect, so the first paint already has the
 * right styles. `apply` may change between renders (new props); the latest one is always used.
 */
export function useProgressEffect(progress: Progress | undefined, apply: (value: number) => void): void {
  const latest = useRef(apply)
  useLayoutEffect(() => {
    latest.current = apply
  })
  useLayoutEffect(() => {
    if (!progress) return
    const run = (v: number) => latest.current(v)
    run(progress.get())
    return progress.subscribe(run)
  }, [progress])
}
