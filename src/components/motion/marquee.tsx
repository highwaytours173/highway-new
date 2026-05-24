'use client';

import { useReducedMotion } from 'framer-motion';
import React from 'react';
import { cn } from '@/lib/utils';

interface MarqueeProps {
  children: React.ReactNode;
  /** Speed in seconds for one full loop. Default 30. */
  durationSec?: number;
  /** Pause on hover. Default true. */
  pauseOnHover?: boolean;
  /** Reverse direction. Default false. */
  reverse?: boolean;
  /** Fade edges with a mask. Default true. */
  fade?: boolean;
  /** Gap between items. Tailwind class. Default 'gap-8'. */
  gapClassName?: string;
  className?: string;
}

/**
 * Marquee — infinite horizontal scroller. Renders children twice (in-DOM
 * for layout, aria-hidden copy for seamless loop) and uses a CSS keyframe
 * to translate. Pause-on-hover via group state. Respects reduced motion.
 */
export function Marquee({
  children,
  durationSec = 30,
  pauseOnHover = true,
  reverse = false,
  fade = true,
  gapClassName = 'gap-8',
  className,
}: MarqueeProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div
        className={cn(
          'flex flex-wrap items-center justify-center overflow-hidden',
          gapClassName,
          className
        )}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'group relative flex overflow-hidden',
        fade &&
          '[mask-image:linear-gradient(to_right,transparent_0,black_8%,black_92%,transparent_100%)]',
        className
      )}
    >
      <div
        className={cn(
          'flex shrink-0 items-center',
          gapClassName,
          reverse ? 'animate-marquee-reverse' : 'animate-marquee',
          pauseOnHover && 'group-hover:[animation-play-state:paused]'
        )}
        style={{ animationDuration: `${durationSec}s` }}
      >
        {children}
        {/* spacer matches gap */}
        <div aria-hidden className={cn('flex shrink-0 items-center', gapClassName)}>
          {children}
        </div>
      </div>
    </div>
  );
}
