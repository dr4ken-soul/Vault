import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'

const ease = [0.22, 1, 0.36, 1] as const

/**
 * Standard Vault entrance: blur + fade + lift.
 * Use `once` scroll reveals on long pages so motion is visible while scrolling.
 */
export function BlurIn({
  children,
  delay = 0,
  className = '',
  once = true,
  amount = 0.2,
}: {
  children: ReactNode
  delay?: number
  className?: string
  /** When true, animates when entering the viewport (landing sections). */
  once?: boolean
  amount?: number
}) {
  const reduce = useReducedMotion()

  if (reduce) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18, filter: 'blur(10px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once, amount, margin: '0px 0px -40px 0px' }}
      transition={{ duration: 0.65, delay, ease }}
    >
      {children}
    </motion.div>
  )
}

/** Instant mount animation for app shell content (no scroll dependency). */
export function BlurInMount({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const reduce = useReducedMotion()

  if (reduce) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 14, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.55, delay, ease }}
    >
      {children}
    </motion.div>
  )
}
