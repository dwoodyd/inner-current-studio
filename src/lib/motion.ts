/**
 * Motion tokens — Inner Wake.
 *
 * Motion language: *current, flow, breath*. Fluid, luminous, quiet.
 * Everything here animates transform/opacity only, stays interruptible,
 * and degrades to a plain fade under `prefers-reduced-motion`.
 */
import type { Transition, Variants } from 'framer-motion';

/** Spring presets — one place so timings never drift between surfaces. */
export const spring = {
  /** Default UI spring: quick, barely overshoots. */
  ui: { type: 'spring', stiffness: 420, damping: 34, mass: 0.9 } as Transition,
  /** Press / tap response. */
  press: { type: 'spring', stiffness: 700, damping: 30, mass: 0.6 } as Transition,
  /** Sheets, drawers, presence — carries a little weight. */
  surface: { type: 'spring', stiffness: 320, damping: 36, mass: 1 } as Transition,
  /** Breath / current — slow, water-like. */
  current: { type: 'spring', stiffness: 90, damping: 22, mass: 1.4 } as Transition,
} as const;

/** Eased durations, in seconds. */
export const duration = {
  fast: 0.2,
  base: 0.26,
  slow: 0.32,
  bloom: 0.9,
} as const;

export const ease = {
  out: [0.22, 1, 0.36, 1] as const,
  inOut: [0.65, 0, 0.35, 1] as const,
};

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;

/** Content settling in: fade + a few px rise. */
export const rise: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: duration.base, ease: ease.out } },
  exit: { opacity: 0, y: -4, transition: { duration: duration.fast, ease: ease.out } },
};

/** Route cross-fade — back should feel like reversing forward. */
export const routeFade: Variants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: duration.base, ease: ease.out } },
  exit: { opacity: 0, transition: { duration: 0.16, ease: ease.out } },
};

/** Lists assemble rather than pop. */
export const stagger = (delayChildren = 0.04): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: 0.04, delayChildren } },
});

/** Press feedback for framer-driven elements. */
export const pressable = {
  whileTap: { scale: 0.97 },
  transition: spring.press,
} as const;
