import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  /** Display label. */
  label: string;
  /** Optional href. When omitted, the item renders as the current/last page (no link). */
  href?: string;
}

interface BreadcrumbsProps {
  /** Sequence of breadcrumbs WITHOUT the leading Home (it's always added). */
  items: BreadcrumbItem[];
  className?: string;
  /** Override the leading "Home" label/href if needed. */
  rootLabel?: string;
  rootHref?: string;
  /** Hide the leading home icon. */
  hideHomeIcon?: boolean;
}

/**
 * Breadcrumbs — accessible site-level navigation trail.
 *
 * - Always starts with Home (configurable).
 * - The last item in `items` is rendered as the current page (no link),
 *   regardless of whether you pass an `href`.
 * - Truncates long labels with `line-clamp-1` to keep the rail compact.
 */
export function Breadcrumbs({
  items,
  className,
  rootLabel = 'Home',
  rootHref = '/',
  hideHomeIcon = false,
}: BreadcrumbsProps) {
  const all: BreadcrumbItem[] = [{ label: rootLabel, href: rootHref }, ...items];

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('text-sm text-muted-foreground', className)}
    >
      <ol className="flex flex-wrap items-center gap-1.5">
        {all.map((item, idx) => {
          const isLast = idx === all.length - 1;
          const isFirst = idx === 0;
          return (
            <li key={`${item.label}-${idx}`} className="inline-flex items-center gap-1.5 min-w-0">
              {idx > 0 && (
                <ChevronRight
                  className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50"
                  aria-hidden="true"
                />
              )}
              {isLast || !item.href ? (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className="line-clamp-1 font-medium text-foreground"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1 line-clamp-1 hover:text-foreground transition-colors"
                >
                  {isFirst && !hideHomeIcon && (
                    <Home className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  )}
                  <span className="line-clamp-1">{item.label}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
