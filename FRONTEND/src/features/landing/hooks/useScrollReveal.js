import { useReducedMotion } from 'framer-motion'
import { revealTransition, revealVariants, revealViewport } from '../utils/scrollReveal'

/**
 * Viewport-driven fade-in + slide-up. Use with `motion.*` or read `isReduced` for static fallbacks.
 */
function useScrollReveal(delay = 0) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return { isReduced: true, motionProps: null }
  }

  return {
    isReduced: false,
    motionProps: {
      initial: 'hidden',
      whileInView: 'visible',
      viewport: revealViewport,
      variants: revealVariants,
      transition: revealTransition(delay),
    },
  }
}

export default useScrollReveal
