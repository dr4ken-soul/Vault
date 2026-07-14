import type { Transition, Variants } from 'motion/react'

/** Expo-out style curve used across Vault motion. */
export const vaultEase = [0.16, 1, 0.3, 1] as const

/** Soft exit when content leaves the viewport. */
export const vaultEaseOut = [0.4, 0, 1, 1] as const

export const revealTransition: Transition = {
  duration: 0.8,
  ease: vaultEase,
}

export const revealExitTransition: Transition = {
  duration: 0.45,
  ease: vaultEaseOut,
}

/** Single-block scroll reveal (titles, paragraphs, cards). */
export const revealVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 56,
    filter: 'blur(16px)',
    scale: 0.97,
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    scale: 1,
    transition: revealTransition,
  },
}

/** Slightly lighter variant for dense app interiors. */
export const mountVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 22,
    filter: 'blur(10px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.55,
      ease: vaultEase,
    },
  },
}

/** Parent that staggers children when the section enters view. */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.06,
    },
  },
}

export const staggerItem: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
    filter: 'blur(12px)',
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    scale: 1,
    transition: revealTransition,
  },
}

export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 18,
    filter: 'blur(12px)',
  },
  enter: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.5,
      ease: vaultEase,
    },
  },
  leave: {
    opacity: 0,
    y: -14,
    filter: 'blur(8px)',
    transition: {
      duration: 0.28,
      ease: vaultEaseOut,
    },
  },
}

export const tradeRowTransition: Transition = {
  layout: { type: 'spring', stiffness: 420, damping: 36, mass: 0.8 },
  opacity: { duration: 0.4, ease: vaultEase },
  y: { type: 'spring', stiffness: 380, damping: 28 },
  filter: { duration: 0.4, ease: vaultEase },
  scale: { type: 'spring', stiffness: 400, damping: 30 },
}
