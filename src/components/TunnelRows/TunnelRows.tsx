import { Children, useRef, type ReactNode } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import { useReducedMotion } from '../../lib/useReducedMotion'
import './TunnelRows.css'

// Inspired by the MIT-licensed "Perspective Tunnel Hero" (Daiwiik Harihar, 21st.dev): rows
// travel along the Z axis toward the camera as they scroll into view. Implementation is ours.

function TunnelItem({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 0.55'] })
  const z = useTransform(scrollYProgress, [0, 1], [-240, 0])
  const rotateX = useTransform(scrollYProgress, [0, 1], [9, 0])
  const opacity = useTransform(scrollYProgress, [0, 1], [0.15, 1])
  return (
    <motion.div ref={ref} className="tunnel-item" style={{ z, rotateX, opacity }}>
      {children}
    </motion.div>
  )
}

export function TunnelRows({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion()
  if (reduce) return <div className="tunnel-static">{children}</div>
  return <div className="tunnel">{Children.map(children, (c) => <TunnelItem>{c}</TunnelItem>)}</div>
}
