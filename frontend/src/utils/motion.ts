import { Variants } from 'framer-motion';

/**
 * Professional Editorial Motion System
 * Built with Framer Motion tokens honoring prefers-reduced-motion,
 * zero layout shift, smooth cubic-bezier easing, and restrained transforms.
 */

// Natural editorial easing
export const transitionEasing = [0.16, 1, 0.3, 1] as const;

// Container Stagger Variants
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

// Subtle upward fade for headers, sections, and cards
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: transitionEasing,
    },
  },
};

// Smooth fade in without spatial movement
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: transitionEasing,
    },
  },
};

// Staggered child item
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: transitionEasing,
    },
  },
};

// Interactive card micro-motion
export const cardInteractiveHover = {
  y: -3,
  transition: {
    duration: 0.2,
    ease: 'easeOut',
  },
};
