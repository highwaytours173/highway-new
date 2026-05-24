'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import React from 'react';

interface PageTransitionProps {
  children: React.ReactNode;
}

/**
 * PageTransition — wraps page children with a soft fade+lift transition on
 * route change. Reads `usePathname()` and keys an `AnimatePresence` block
 * so each route gets its own motion lifecycle.
 *
 * - Subtle by design (no horizontal slides) so it complements the
 *   scroll-scrub hero and reveals already in place.
 * - Falls back to a static render when `prefers-reduced-motion` is set.
 */
export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
