'use client';

import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from 'framer-motion';
import { useEffect, useRef } from 'react';

interface CountUpProps {
  to: number;
  from?: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  /** How much of the element must be visible to start the count (0..1). Default 0.4. */
  amount?: number;
}

/**
 * CountUp — animates a number from `from` → `to` once the element scrolls
 * into view. Uses a spring for natural deceleration.
 * Respects `prefers-reduced-motion` (jumps directly to `to`).
 */
export function CountUp({
  to,
  from = 0,
  duration = 1.4,
  decimals = 0,
  prefix = '',
  suffix = '',
  className,
  amount = 0.4,
}: CountUpProps) {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount });

  const motionValue = useMotionValue(from);
  const stiffness = 60 / Math.max(0.4, duration);
  const spring = useSpring(motionValue, { stiffness, damping: 26, mass: 1 });
  const display = useTransform(spring, (latest) => {
    const value = decimals > 0 ? latest.toFixed(decimals) : Math.round(latest).toString();
    return `${prefix}${value}${suffix}`;
  });

  useEffect(() => {
    if (!inView) return;
    if (prefersReducedMotion) {
      motionValue.jump(to);
    } else {
      motionValue.set(to);
    }
  }, [inView, to, motionValue, prefersReducedMotion]);

  return (
    <motion.span ref={ref} className={className}>
      {display}
    </motion.span>
  );
}
