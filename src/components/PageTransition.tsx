import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'
import { pageVariants } from '../lib/motion'

export function PageTransition({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion()

  if (reduce) return <>{children}</>

  return (
    <motion.div
      className="reveal-layer"
      variants={pageVariants}
      initial="initial"
      animate="enter"
      exit="leave"
    >
      {children}
    </motion.div>
  )
}
