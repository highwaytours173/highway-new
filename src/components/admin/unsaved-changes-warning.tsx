'use client';

import { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UnsavedChangesWarningProps {
  /** When true, the page is considered dirty (form has unsaved edits). */
  dirty: boolean;
  /** Suppress all behaviour without removing the component. */
  disabled?: boolean;
  /** Optional inline indicator class override. */
  className?: string;
  /** Render the inline dirty badge. Default true. */
  showBadge?: boolean;
}

/**
 * UnsavedChangesWarning — protects long admin forms from "accidentally
 * closed the tab" data loss.
 *
 * When `dirty` is true and `disabled` is false:
 *   - Registers a `beforeunload` listener that prompts the browser's
 *     native "Leave site?" confirmation
 *   - Prepends a "● " to `document.title` so the tab visually signals
 *     unsaved state (Apple Notes / Slack style)
 *   - Renders an inline "Unsaved changes" badge so the agency knows the
 *     state without having to read tab titles
 *
 * Place it once per form, near the Save button.
 */
export function UnsavedChangesWarning({
  dirty,
  disabled,
  className,
  showBadge = true,
}: UnsavedChangesWarningProps) {
  // beforeunload guard
  useEffect(() => {
    if (!dirty || disabled) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Modern browsers ignore the returned string and show their own
      // localized prompt; setting returnValue is the spec-compliant way
      // to trigger it.
      e.returnValue = '';
      return '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty, disabled]);

  // Title indicator
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const original = document.title;
    if (dirty && !disabled && !original.startsWith('● ')) {
      document.title = `● ${original}`;
    } else if ((!dirty || disabled) && original.startsWith('● ')) {
      document.title = original.replace(/^● /, '');
    }
    return () => {
      if (typeof document === 'undefined') return;
      // Restore on unmount
      document.title = document.title.replace(/^● /, '');
    };
  }, [dirty, disabled]);

  if (!showBadge || !dirty || disabled) return null;

  return (
    <span
      role="status"
      aria-live="polite"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-900 dark:bg-amber-950/50 dark:text-amber-200',
        className
      )}
    >
      <AlertCircle className="h-3 w-3" />
      Unsaved changes
    </span>
  );
}
