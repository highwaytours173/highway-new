'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import React from 'react';
import { cn } from '@/lib/utils';

interface SplitTextProps {
  /** The text content. HTML is NOT supported — pass plain strings. */
  text: string;
  /** Whether to split into words ('word', default) or characters ('char'). */
  split?: 'word' | 'char';
  /** Delay between siblings. Default 0.05s. */
  staggerDelay?: number;
  /** Delay before first item. */
  delay?: number;
  /** Wrapper tag for the entire text. Defaults to `span`. */
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'p' | 'div';
  className?: string;
  /** Translate distance (px) on initial state. Default 18. */
  distance?: number;
  /** Whether to animate once on mount (default) or every time entering viewport. */
  once?: boolean;
  /** When using viewport-triggered reveal, how much of the element must be visible (0..1). */
  amount?: number;
}

/**
 * SplitText — animates a heading by splitting it into words (or chars) and
 * revealing each in sequence with a subtle lift + fade.
 *
 * Use sparingly on hero titles for maximum effect. Accessible — the parent
 * has the readable text via aria-label; individual spans are aria-hidden.
 */
export function SplitText({
  text,
  split = 'word',
  staggerDelay = 0.05,
  delay = 0,
  as = 'span',
  className,
  distance = 18,
  once = true,
  amount = 0.4,
}: SplitTextProps) {
  const prefersReducedMotion = useReducedMotion();
  const tokens = React.useMemo(() => {
    if (split === 'char') return Array.from(text);
    // Word split preserves spaces by re-injecting them.
    return text.split(/(\s+)/).filter((t) => t.length > 0);
  }, [text, split]);

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        delayChildren: delay,
        staggerChildren: prefersReducedMotion ? 0 : staggerDelay,
      },
    },
  };

  const childVariants: Variants = {
    hidden: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: distance },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: prefersReducedMotion ? 0.2 : 0.5, ease: [0.16, 1, 0.3, 1] },
    },
  };

  const MotionTag = motion[as] as typeof motion.span;

  return (
    <MotionTag
      className={cn('inline-block', className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={containerVariants}
      aria-label={text}
    >
      {tokens.map((token, i) => {
        // Whitespace — keep as-is so word spacing renders correctly.
        if (/^\s+$/.test(token)) {
          return (
            <span key={`${token}-${i}`} aria-hidden="true">
              {token}
            </span>
          );
        }
        return (
          <span
            key={`${token}-${i}`}
            aria-hidden="true"
            className="inline-block overflow-hidden align-baseline"
          >
            <motion.span variants={childVariants} className="inline-block will-change-transform">
              {token}
            </motion.span>
          </span>
        );
      })}
    </MotionTag>
  );
}
