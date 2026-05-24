'use client';

import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';
import React, { useRef } from 'react';
import { cn } from '@/lib/utils';

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  /** Strength multiplier for the magnetic pull. 0..1. Default 0.25. */
  strength?: number;
  /** Distance in px the pointer must enter before pull activates. Default 80. */
  radius?: number;
  className?: string;
}

/**
 * MagneticButton — button that subtly follows the pointer when the cursor
 * is nearby. Desktop-only effect; on touch and reduced-motion devices it
 * renders as a plain button. Use when you want a single magnetic <button>.
 */
export function MagneticButton({
  children,
  strength = 0.25,
  radius = 80,
  className,
  ...props
}: MagneticButtonProps) {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLButtonElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });

  const isPointerCapable =
    typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches;

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (prefersReducedMotion || !isPointerCapable) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist > radius) {
      x.set(0);
      y.set(0);
      return;
    }
    x.set(dx * strength);
    y.set(dy * strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  if (prefersReducedMotion) {
    return (
      <button ref={ref} className={className} {...props}>
        {children}
      </button>
    );
  }

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className={cn('will-change-transform', className)}
      {...(props as React.ComponentProps<typeof motion.button>)}
    >
      {children}
    </motion.button>
  );
}

interface MagneticWrapProps {
  children: React.ReactNode;
  /** Strength multiplier for the magnetic pull. 0..1. Default 0.2. */
  strength?: number;
  /** Distance in px the pointer must enter before pull activates. Default 90. */
  radius?: number;
  className?: string;
}

/**
 * MagneticWrap — wraps any existing element (e.g. shadcn `<Button>`,
 * `<Link>`, image, card) and applies the magnetic-pull effect without
 * changing the underlying semantics. The wrapper renders a `motion.span`
 * with `display: inline-block` so it doesn't break button/link layout.
 *
 * Prefer this over `<MagneticButton>` when you want to keep using the
 * existing Button component (for accessibility + variant styling).
 */
export function MagneticWrap({
  children,
  strength = 0.2,
  radius = 90,
  className,
}: MagneticWrapProps) {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });

  const isPointerCapable =
    typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches;

  const handleMouseMove = (e: React.MouseEvent<HTMLSpanElement>) => {
    if (prefersReducedMotion || !isPointerCapable) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist > radius) {
      x.set(0);
      y.set(0);
      return;
    }
    x.set(dx * strength);
    y.set(dy * strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  if (prefersReducedMotion) {
    return <span className={cn('inline-block', className)}>{children}</span>;
  }

  return (
    <motion.span
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY, display: 'inline-block' }}
      className={cn('will-change-transform', className)}
    >
      {children}
    </motion.span>
  );
}
