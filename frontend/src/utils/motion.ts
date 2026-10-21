import { Variants } from 'framer-motion';

/**
 * Premium Editorial Motion System
 * Framer Motion variants honoring prefers-reduced-motion,
 * with expressive easing, spring physics, and refined transforms.
 */

// ─── Easing Curves ────────────────────────────────────────────────────────────
export const ease = {
  editorial: [0.16, 1, 0.3, 1] as const,
  smooth: [0.25, 0.46, 0.45, 0.94] as const,
  spring: { type: 'spring', stiffness: 260, damping: 20 },
  springSnappy: { type: 'spring', stiffness: 380, damping: 30 },
  springBounce: { type: 'spring', stiffness: 200, damping: 15 },
} as const;

// Legacy export for backward compat
export const transitionEasing = ease.editorial;

// ─── Container / Stagger ─────────────────────────────────────────────────────
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.06,
    },
  },
};

export const staggerContainerFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
};

// ─── Fade Variants ───────────────────────────────────────────────────────────
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: ease.editorial },
  },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: ease.editorial },
  },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: ease.editorial },
  },
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.55, ease: ease.editorial },
  },
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.55, ease: ease.editorial },
  },
};

// ─── Scale Variants ──────────────────────────────────────────────────────────
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: ease.editorial },
  },
};

export const scaleInSpring: Variants = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: ease.spring,
  },
};

// ─── Clip-path Reveal ────────────────────────────────────────────────────────
export const clipRevealUp: Variants = {
  hidden: {
    clipPath: 'inset(100% 0% 0% 0%)',
    opacity: 0,
  },
  visible: {
    clipPath: 'inset(0% 0% 0% 0%)',
    opacity: 1,
    transition: { duration: 0.65, ease: ease.editorial },
  },
};

// ─── Stagger Items ───────────────────────────────────────────────────────────
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: ease.editorial },
  },
};

export const staggerItemLeft: Variants = {
  hidden: { opacity: 0, x: -16 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: ease.editorial },
  },
};

// ─── Interactive Micro-motion ────────────────────────────────────────────────
export const cardInteractiveHover = {
  y: -4,
  transition: { duration: 0.22, ease: 'easeOut' },
};

export const buttonPressVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.025 },
  tap: { scale: 0.975 },
};

// ─── Number Counter ──────────────────────────────────────────────────────────
export const counterVariant: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: ease.editorial },
  },
};
