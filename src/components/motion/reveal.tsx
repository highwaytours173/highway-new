'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import React from 'react';

type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

interface RevealProps {
  children: React.ReactNode;
  direction?: Direction;
  delay?: number;
  duration?: number;
  distance?: number;
  className?: string;
  once?: boolean;
  /** When false, the wrapper renders nothing extra and animations are skipped. Useful for SSR-only contexts. */
  enabled?: boolean;
  /** How much of the element must be visible before triggering (0..1). Default 0.15. */
  amount?: number;
  /** Wrapper tag. Defaults to a `div`. */
  as?: 'div' | 'section' | 'span' | 'li' | 'article';
}

/**
 * Reveal — fades and slides children into view once they enter the viewport.
 *
 * - Default direction: 'up' (gentle 24px translate).
 * - Respects `prefers-reduced-motion`: degrades to a pure fade.
 * - Triggers once by default (`once = true`).
 */
export function Reveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.6,
  distance = 24,
  className,
  once = true,
  enabled = true,
  amount = 0.15,
  as = 'div',
}: RevealProps) {
  const prefersReducedMotion = useReducedMotion();
  const MotionTag = motion[as] as typeof motion.div;

  if (!enabled) {
    return <div className={className}>{children}</div>;
  }

  const offset =
    prefersReducedMotion || direction === 'none'
      ? { x: 0, y: 0 }
      : direction === 'up'
        ? { x: 0, y: distance }
        : direction === 'down'
          ? { x: 0, y: -distance }
          : direction === 'left'
            ? { x: distance, y: 0 }
            : { x: -distance, y: 0 };

  const variants: Variants = {
    hidden: { opacity: 0, ...offset },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0.2 : duration,
        ease: [0.16, 1, 0.3, 1],
        delay,
      },
    },
  };

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={variants}
    >
      {children}
    </MotionTag>
  );
}

interface StaggerProps {
  children: React.ReactNode;
  className?: string;
  /** Delay between child reveals (s). */
  staggerDelay?: number;
  /** Initial delay before first child. */
  delay?: number;
  amount?: number;
  once?: boolean;
}

/**
 * Stagger — wraps a list so each direct child receives an incrementally
 * delayed reveal. Children must use `<Reveal />` themselves OR plain
 * motion.* elements that consume the parent's stagger.
 *
 * Simpler pattern: pair with `<Reveal>` per child for explicit control,
 * or wrap a list and let it cascade.
 */
export function Stagger({
  children,
  className,
  staggerDelay = 0.08,
  delay = 0,
  amount = 0.15,
  once = true,
}: StaggerProps) {
  const prefersReducedMotion = useReducedMotion();

  const variants: Variants = {
    hidden: {},
    visible: {
      transition: {
        delayChildren: delay,
        staggerChildren: prefersReducedMotion ? 0 : staggerDelay,
      },
    },
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={variants}
    >
      {children}
    </motion.div>
  );
}

/**
 * StaggerItem — child variant matching the parent Stagger's cascade.
 * Use for items that should animate in sequence inside a `<Stagger>`.
 */
export function StaggerItem({
  children,
  className,
  direction = 'up',
  distance = 20,
}: {
  children: React.ReactNode;
  className?: string;
  direction?: Direction;
  distance?: number;
}) {
  const prefersReducedMotion = useReducedMotion();
  const offset =
    prefersReducedMotion || direction === 'none'
      ? { x: 0, y: 0 }
      : direction === 'up'
        ? { x: 0, y: distance }
        : direction === 'down'
          ? { x: 0, y: -distance }
          : direction === 'left'
            ? { x: distance, y: 0 }
            : { x: -distance, y: 0 };

  const variants: Variants = {
    hidden: { opacity: 0, ...offset },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration: prefersReducedMotion ? 0.2 : 0.55, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <motion.div className={className} variants={variants}>
      {children}
    </motion.div>
  );
}
