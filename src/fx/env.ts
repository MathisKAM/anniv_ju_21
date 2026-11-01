export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Rough check for weaker phones: halves particle counts and disables costly effects. */
export const isLowPower = () => {
  const n = navigator as Navigator & { deviceMemory?: number }
  return (n.hardwareConcurrency ?? 8) <= 4 || (n.deviceMemory ?? 8) <= 2
}

export const particleScale = () => (isLowPower() ? 0.5 : 1)
