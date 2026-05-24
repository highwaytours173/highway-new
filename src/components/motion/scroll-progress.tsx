'use client';

import { motion, useScroll, useSpring } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ScrollProgressProps {
  className?: string;
}

/**
 * ScrollProgress — thin gradient bar fixed to the top of the viewport that
 * tracks document scroll. Apple-style smooth spring scaling.
 */
export function ScrollProgress({ className }: ScrollProgressProps) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 220,
    damping: 32,
    mass: 0.4,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden
      className={cn(
        'pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px] origin-left',
        'bg-gradient-to-r from-primary via-accent to-primary',
        className
      )}
      style={{ scaleX }}
    />
  );
}
