'use client';

import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from 'framer-motion';
import React, { useRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * ScrollScrub — wraps a hero-style section and exposes an Apple-like
 * scroll-linked effect: as the user scrolls past the section the content
 * fades, slightly translates up, and the (optional) background scales up.
 *
 * Use this for the home hero. Pass the static section markup as children.
 * The background layer is rendered first (z-0) with parallax, the content
 * layer (children) is rendered above (z-10) with fade/translate.
 */
export function ScrollScrub({
  background,
  children,
  className,
  /** Maximum translate-up applied to content. */
  contentLift = 60,
  /** Maximum scale applied to background. */
  backgroundScale = 1.18,
  /** Fade content out by this fraction of scroll (0..1). 0.7 = fully faded at 70%. */
  fadeBy = 0.85,
}: {
  background: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentLift?: number;
  backgroundScale?: number;
  fadeBy?: number;
}) {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  // Background: scale up subtly as you scroll
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, backgroundScale]);
  // Slight vertical drift on the background (parallax)
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '12%']);

  // Content: fade + lift
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -contentLift]);
  const contentOpacity = useTransform(scrollYProgress, [0, fadeBy], [1, 0]);

  if (prefersReducedMotion) {
    return (
      <div ref={ref} className={cn('relative', className)}>
        <div className="absolute inset-0 z-0">{background}</div>
        <div className="relative z-10">{children}</div>
      </div>
    );
  }

  return (
    <div ref={ref} className={cn('relative', className)}>
      <motion.div
        className="absolute inset-0 z-0 will-change-transform"
        style={{ scale: bgScale, y: bgY }}
      >
        {background}
      </motion.div>
      <motion.div
        className="relative z-10 will-change-transform"
        style={{ y: contentY, opacity: contentOpacity }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/**
 * ScrollScrubChild — utility for fine-grained per-element scroll-linked
 * effects inside a parent that uses `useScroll`. Caller passes its own
 * motion value (typically derived from a parent scrollYProgress) — kept
 * lightweight on purpose; most cases should use `<ScrollScrub />` above.
 */
export function ScrollScrubChild({
  children,
  opacity,
  y,
  scale,
  className,
}: {
  children: React.ReactNode;
  opacity?: MotionValue<number>;
  y?: MotionValue<number>;
  scale?: MotionValue<number>;
  className?: string;
}) {
  return (
    <motion.div className={cn('will-change-transform', className)} style={{ opacity, y, scale }}>
      {children}
    </motion.div>
  );
}
