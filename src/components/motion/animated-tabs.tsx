'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedTabItem {
  key: string;
  label: React.ReactNode;
}

interface AnimatedTabsProps {
  items: AnimatedTabItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  /** Underline variant. 'pill' fills the active item; 'underline' shows a thin bar. */
  variant?: 'pill' | 'underline';
}

/**
 * AnimatedTabs — accessible tab strip with a sliding active indicator powered
 * by Framer Motion `layoutId`. Apple-style smooth transition between tabs.
 *
 * For accessibility, renders proper `role="tablist"` and `role="tab"`. Pair
 * with `<AnimatedTabPanel value={value} />` if you want auto-managed content
 * areas, or wire your own conditional rendering via `onValueChange`.
 */
export function AnimatedTabs({
  items,
  value,
  defaultValue,
  onValueChange,
  className,
  variant = 'underline',
}: AnimatedTabsProps) {
  const [internal, setInternal] = useState(defaultValue ?? items[0]?.key ?? '');
  const active = value ?? internal;
  const prefersReducedMotion = useReducedMotion();

  const setActive = (next: string) => {
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
  };

  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      className={cn(
        'relative inline-flex gap-1',
        variant === 'pill' && 'rounded-full bg-muted p-1',
        variant === 'underline' && 'border-b border-border',
        className
      )}
    >
      {items.map((item) => {
        const isActive = item.key === active;
        return (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => setActive(item.key)}
            className={cn(
              'relative z-10 px-3 py-1.5 text-sm font-medium transition-colors',
              variant === 'pill' && 'rounded-full',
              variant === 'underline' && '-mb-px pb-2.5',
              isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {item.label}
            {isActive && (
              <motion.span
                aria-hidden
                layoutId="animated-tabs-indicator"
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 380, damping: 32 }
                }
                className={cn(
                  variant === 'pill' &&
                    'absolute inset-0 -z-10 rounded-full bg-background shadow-sm',
                  variant === 'underline' && 'absolute inset-x-0 bottom-0 h-[2px] bg-primary'
                )}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
