export const revealVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

export function revealTransition(delay = 0) {
  return {
    duration: 0.5,
    delay,
    ease: [0.25, 0.1, 0.25, 1],
  }
}

export const revealViewport = {
  once: true,
  amount: 0.12,
  margin: '0px 0px -32px 0px',
}
