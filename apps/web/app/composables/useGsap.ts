import { gsap } from 'gsap'

/**
 * Synthwave animation presets using GSAP
 * Safe for client-side only execution
 */
export function useGsap() {
  const isClient = typeof window !== 'undefined'

  /**
   * Neon pulse animation - creates a pulsing glow effect
   */
  const neonPulse = (element: gsap.TweenTarget, options?: {
    color?: string
    duration?: number
    repeat?: number
  }) => {
    if (!isClient) return null

    const { color = '#FF00FF', duration = 1.5, repeat = -1 } = options || {}

    return gsap.to(element, {
      boxShadow: `0 0 20px ${color}, 0 0 40px ${color}, 0 0 60px ${color}`,
      duration,
      repeat,
      yoyo: true,
      ease: 'power2.inOut'
    })
  }

  /**
   * Glitch text effect - creates a retro glitch animation
   */
  const glitchText = (element: gsap.TweenTarget, options?: {
    duration?: number
    repeat?: number
  }) => {
    if (!isClient) return null

    const { duration = 0.1, repeat = 5 } = options || {}

    const tl = gsap.timeline({ repeat })

    tl.to(element, {
      x: -2,
      skewX: 2,
      duration,
      ease: 'power2.inOut'
    })
    .to(element, {
      x: 2,
      skewX: -2,
      duration,
      ease: 'power2.inOut'
    })
    .to(element, {
      x: 0,
      skewX: 0,
      duration,
      ease: 'power2.inOut'
    })

    return tl
  }

  /**
   * Neon flicker effect - simulates a flickering neon sign
   */
  const neonFlicker = (element: gsap.TweenTarget, options?: {
    duration?: number
  }) => {
    if (!isClient) return null

    const { duration = 0.15 } = options || {}

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 3 })

    tl.to(element, { opacity: 0.7, duration })
      .to(element, { opacity: 1, duration })
      .to(element, { opacity: 0.8, duration: duration / 2 })
      .to(element, { opacity: 1, duration: duration / 2 })

    return tl
  }

  /**
   * Card hover glow - adds a neon glow on hover
   */
  const cardHoverGlow = (element: gsap.TweenTarget, options?: {
    color?: string
    intensity?: number
  }) => {
    if (!isClient) return null

    const { color = '#00FFFF', intensity = 20 } = options || {}

    return gsap.to(element, {
      boxShadow: `0 0 ${intensity}px ${color}, 0 0 ${intensity * 2}px ${color}`,
      scale: 1.02,
      duration: 0.3,
      ease: 'power2.out',
      paused: true
    })
  }

  /**
   * Scanline effect animation
   */
  const scanlineEffect = (element: gsap.TweenTarget) => {
    if (!isClient) return null

    return gsap.to(element, {
      backgroundPositionY: '100%',
      duration: 8,
      repeat: -1,
      ease: 'linear'
    })
  }

  /**
   * Staggered neon entrance animation
   */
  const staggeredNeonEntrance = (elements: gsap.TweenTarget, options?: {
    stagger?: number
    duration?: number
    glowColor?: string
  }) => {
    if (!isClient) return null

    const { stagger = 0.1, duration = 0.6, glowColor = '#FF00FF' } = options || {}

    return gsap.from(elements, {
      opacity: 0,
      y: 20,
      boxShadow: `0 0 0px ${glowColor}`,
      duration,
      stagger,
      ease: 'power2.out'
    })
  }

  /**
   * Gradient text animation - shifts gradient colors
   */
  const animateGradientText = (element: gsap.TweenTarget) => {
    if (!isClient) return null

    return gsap.to(element, {
      backgroundPosition: '200% center',
      duration: 3,
      repeat: -1,
      ease: 'linear'
    })
  }

  return {
    gsap,
    neonPulse,
    glitchText,
    neonFlicker,
    cardHoverGlow,
    scanlineEffect,
    staggeredNeonEntrance,
    animateGradientText
  }
}
