'use client';

import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import Image, { type ImageProps } from 'next/image';
import { useRef } from 'react';
import { cn } from '@/lib/utils';

interface ParallaxImageProps extends Omit<ImageProps, 'placeholder' | 'blurDataURL'> {
  /** Vertical translate range in pixels at full scroll. Default 80. */
  range?: number;
  /** Container className — controls aspect ratio / sizing. */
  containerClassName?: string;
  /** Optional scale at end of scroll (1 = no zoom). Default 1.06. */
  scaleTo?: number;
}

/**
 * ParallaxImage — Next/Image that translates and slightly scales as the
 * viewer scrolls past it. Pure CSS transform; no layout shift.
 * Respects `prefers-reduced-motion` (renders as a static image).
 */
export function ParallaxImage({
  range = 80,
  containerClassName,
  scaleTo = 1.06,
  alt,
  className,
  ...imageProps
}: ParallaxImageProps) {
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [range, -range]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, scaleTo, 1]);

  if (prefersReducedMotion) {
    return (
      <div ref={containerRef} className={cn('relative overflow-hidden', containerClassName)}>
        <Image alt={alt} className={cn('object-cover', className)} {...imageProps} />
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn('relative overflow-hidden', containerClassName)}>
      <motion.div className="absolute inset-0 will-change-transform" style={{ y, scale }}>
        <Image alt={alt} className={cn('object-cover', className)} {...imageProps} />
      </motion.div>
    </div>
  );
}
