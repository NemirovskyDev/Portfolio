import { Children, useState, type ReactNode } from 'react'
import { motion, type Variants } from 'motion/react'
import { useReducedMotion } from '../../lib/useReducedMotion'
import './RevealRows.css'

// 450 ms with an exponential ease-out: the entry range the design system sets (MASTER.md, 300 to 450 ms).
const REVEAL_S = 0.45
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const

// Each row tilts up into place and its cards follow one after another (medium intensity).
export const rowVariants: Variants = {
  hidden: { opacity: 0, rotateX: 18, y: 60 },
  shown: {
    opacity: 1,
    rotateX: 0,
    y: 0,
    transition: { duration: REVEAL_S, ease: EASE_OUT_EXPO, staggerChildren: 0.06 },
  },
}

export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24, rotateY: -12 },
  shown: { opacity: 1, y: 0, rotateY: 0, transition: { duration: REVEAL_S, ease: EASE_OUT_EXPO } },
}

function RevealItem({ children }: { children: ReactNode }) {
  // Tabbing into a row that is not yet revealed must show it, even before the observer fires.
  const [focused, setFocused] = useState(false)
  return (
    <motion.div
      className="reveal-item"
      variants={rowVariants}
      initial="hidden"
      whileInView="shown"
      animate={focused ? 'shown' : undefined}
      viewport={{ once: true, amount: 0.2 }}
      onFocusCapture={() => setFocused(true)}
    >
      {children}
    </motion.div>
  )
}

export function RevealRows({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion()
  // Without IntersectionObserver (old browser, print, crawler) nothing would ever reveal the rows.
  const canObserve = typeof window !== 'undefined' && 'IntersectionObserver' in window
  if (reduce || !canObserve) return <div className="reveal-static">{children}</div>
  return <div className="reveal-rows">{Children.map(children, (c) => <RevealItem>{c}</RevealItem>)}</div>
}
