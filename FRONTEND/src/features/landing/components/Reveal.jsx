import { motion } from 'framer-motion'
import useScrollReveal from '../hooks/useScrollReveal'

/**
 * Fade-in + slide-up when the block enters the viewport.
 * Use `as="li"` inside `<ol>` / `<ul>` so markup stays valid.
 */
function Reveal({ as = 'div', children, className = '', delay = 0, ...motionProps }) {
  const { isReduced, motionProps: scrollProps } = useScrollReveal(delay)
  const MotionComponent = motion[as] || motion.div

  if (isReduced) {
    if (as === 'li') {
      return <li className={className}>{children}</li>
    }
    return <div className={className}>{children}</div>
  }

  return (
    <MotionComponent className={className} {...scrollProps} {...motionProps}>
      {children}
    </MotionComponent>
  )
}

export default Reveal
