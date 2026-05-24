'use client';

import { useMemo } from 'react';
import { Clock } from 'lucide-react';
import { TourCard } from '@/components/tour-card';
import { useRecentlyViewed } from '@/hooks/use-recently-viewed';
import { Stagger, StaggerItem } from '@/components/motion';
import { Button } from '@/components/ui/button';
import type { Tour } from '@/types';

interface RecentlyViewedRailProps {
  /** Catalog of tours available to render. Pass the same list used elsewhere
   *  on the page (e.g. initialTours on home, allTours on the listing page). */
  catalog: Tour[];
  /** Hide the tour currently being viewed (e.g. on the tour detail page). */
  excludeId?: string;
  /** Max number of cards to show. Default 4. */
  limit?: number;
  /** Optional title override. */
  title?: string;
  className?: string;
}

/**
 * RecentlyViewedRail — surfaces tours the user previously visited, sourced
 * from the `tourista:recently-viewed:v1` localStorage entry.
 *
 * Renders nothing until hydration completes (`hydrated === true`) AND at
 * least one previously-viewed tour exists in the supplied catalog. This
 * keeps SSR markup empty and avoids hydration mismatches.
 */
export function RecentlyViewedRail({
  catalog,
  excludeId,
  limit = 4,
  title = 'Recently viewed',
  className,
}: RecentlyViewedRailProps) {
  const { ids, hydrated, clear } = useRecentlyViewed();

  const tours = useMemo(() => {
    if (!hydrated || ids.length === 0) return [];
    const byId = new Map(catalog.map((t) => [t.id, t]));
    const out: Tour[] = [];
    for (const id of ids) {
      if (excludeId && id === excludeId) continue;
      const t = byId.get(id);
      if (t) out.push(t);
      if (out.length >= limit) break;
    }
    return out;
  }, [catalog, ids, excludeId, limit, hydrated]);

  if (!hydrated || tours.length === 0) return null;

  return (
    <section className={className}>
      <div className="mb-5 flex items-baseline justify-between gap-3">
        <h2 className="font-headline text-2xl md:text-3xl font-bold inline-flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          {title}
        </h2>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={clear}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Clear
        </Button>
      </div>
      <Stagger
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
        staggerDelay={0.06}
        amount={0.1}
      >
        {tours.map((tour) => (
          <StaggerItem key={tour.id}>
            <TourCard tour={tour} />
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
