import { useState } from 'react'
import { hasWebGL } from './hasWebGL'
import { useReducedMotion } from './useReducedMotion'

type NavigatorHints = Navigator & { deviceMemory?: number }

/** Phones and low-end laptops that report 2 cores or 2 GB or less get the static page. */
function isWeakDevice(): boolean {
  const nav = navigator as NavigatorHints
  return (nav.hardwareConcurrency ?? Infinity) <= 2 || (nav.deviceMemory ?? Infinity) <= 2
}

/** 'cinema' = animated stage with the 3D scene; 'static' = stacked chapters. */
export function useCinemaMode(): 'cinema' | 'static' {
  const reduce = useReducedMotion()
  // hardware does not change during a visit: probe once (the WebGL probe creates a context)
  const [capable] = useState(() => !isWeakDevice() && hasWebGL())
  return reduce || !capable ? 'static' : 'cinema'
}
