'use client';

import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from 'framer-motion';
import React, { useRef } from 'react';
import { cn } from '@/lib/utils';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  /** Max tilt angle in degrees on each axis. Default 6. */
  maxTilt?: number;
  /** Add a subtle scale-up on hover. Default true. */
  scale?: boolean;
  /** Glare highlight that follows the cursor. Default true. */
  glare?: boolean;
}

/**
 * TiltCard — wraps any card with a 3D tilt-on-hover effect. Desktop-only;
 * touch/reduced-motion users get the plain content.
 *
 * Used to add Apple-style depth to tour and hotel cards without changing
 * their layout. Wrap the entire card and pass through `className` for sizing.
 */
export function TiltCard({
  children,
  className,
  maxTilt = 6,
  scale = true,
  glare = true,
}: TiltCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const springConfig = { stiffness: 220, damping: 22, mass: 0.4 };
  const xSpring = useSpring(mouseX, springConfig);
  const ySpring = useSpring(mouseY, springConfig);

  const rotateX = useTransform(ySpring, [0, 1], [maxTilt, -maxTilt]);
  const rotateY = useTransform(xSpring, [0, 1], [-maxTilt, maxTilt]);
  const glareBackground = useTransform(
    [xSpring, ySpring],
    ([x, y]: number[]) =>
      `radial-gradient(420px circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.12), transparent 60%)`
  );

  const isPointerCapable =
    typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !isPointerCapable) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={scale ? { scale: 1.015 } : undefined}
      transition={{ scale: { type: 'spring', stiffness: 280, damping: 22 } }}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 1100,
        transformStyle: 'preserve-3d',
      }}
      className={cn('relative will-change-transform', className)}
    >
      {children}
      {glare && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{ background: glareBackground, mixBlendMode: 'overlay' }}
        />
      )}
    </motion.div>
  );
}
