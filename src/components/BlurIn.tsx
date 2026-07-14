import { motion, useInView, useReducedMotion } from 'motion/react'
import { useRef, type ReactNode } from 'react'
import {
  mountVariants,
  staggerContainer,
  staggerItem,
  vaultEase,
} from '../lib/motion'

/**
 * Scroll-linked reveal that REPLAYS every time the block enters the viewport
 * (scroll down or back up). Leaving the viewport returns it to hidden so the
 * next entry can animate again.
 */
export function BlurIn({
  children,
  delay = 0,
  className = '',
  amount = 0.25,
  /** API compatibility only. Scroll reveals always replay. */
  once: _once = false,
}: {
  children: ReactNode
  delay?: number
  className?: string
  amount?: number
  once?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const inView = useInView(ref, {
    amount,
    margin: '0px 0px -10% 0px',
  })

  if (reduce) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      ref={ref}
      className={`reveal-layer ${className}`.trim()}
      initial={false}
      animate={
        inView
          ? {
              opacity: 1,
              y: 0,
              filter: 'blur(0px)',
              scale: 1,
            }
          : {
              opacity: 0,
              y: 56,
              filter: 'blur(16px)',
              scale: 0.97,
            }
      }
      transition={{
        duration: inView ? 0.8 : 0.4,
        ease: inView ? vaultEase : [0.4, 0, 1, 1],
        delay: inView ? delay : 0,
      }}
    >
      {children}
    </motion.div>
  )
}

/**
 * Staggered group that replays whenever it leaves and re-enters the viewport.
 */
export function StaggerReveal({
  children,
  className = '',
  amount = 0.18,
}: {
  children: ReactNode
  className?: string
  amount?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const inView = useInView(ref, {
    amount,
    margin: '0px 0px -8% 0px',
  })

  if (reduce) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      ref={ref}
      className={`reveal-layer ${className}`.trim()}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={staggerContainer}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div className={className} variants={staggerItem}>
      {children}
    </motion.div>
  )
}

/** Mount-only animation for app routes (no scroll dependency). */
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
      className={`reveal-layer ${className}`.trim()}
      variants={mountVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
    >
      {children}
    </motion.div>
  )
}
