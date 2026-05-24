import { Skeleton } from '@/components/ui/skeleton';
import { HotelCardSkeleton } from '@/components/hotel-card-skeleton';

/**
 * Loading skeleton for a single hotel detail page.
 * Mirrors the live layout: hero gallery → header info → info chips → rooms grid.
 */
export default function HotelDetailLoading() {
  return (
    <div>
      {/* Hero gallery — 1 large + 4 thumbs (md+) */}
      <div className="bg-muted">
        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-1 md:h-[460px]">
          <Skeleton className="md:col-span-2 md:row-span-2 aspect-[16/10] md:aspect-auto" />
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="hidden md:block" />
          ))}
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 py-8 space-y-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-4 w-40" />
        </div>

        {/* Header info */}
        <div className="space-y-4">
          <Skeleton className="h-4 w-32" />
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2 min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <Skeleton className="h-10 w-2/3" />
              <Skeleton className="h-5 w-1/2" />
            </div>
            <Skeleton className="h-11 w-32 rounded-lg" />
          </div>
          <Skeleton className="h-4 w-full max-w-3xl" />
          <Skeleton className="h-4 w-full max-w-3xl" />
          <Skeleton className="h-4 w-2/3 max-w-3xl" />
        </div>

        {/* Info chip row */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 rounded-2xl border bg-card p-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <div className="space-y-1 flex-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          ))}
        </div>

        {/* Rooms section */}
        <div className="space-y-4">
          <div className="flex items-baseline justify-between gap-2">
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <HotelCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
