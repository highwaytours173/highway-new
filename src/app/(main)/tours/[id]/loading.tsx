import { Skeleton } from '@/components/ui/skeleton';

/**
 * Loading skeleton for a single tour detail page.
 * Mirrors the live layout: breadcrumb → 5-col grid (3-col content + 2-col booking widget).
 */
export default function TourDetailLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-3 w-3 rounded-full" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-3 w-3 rounded-full" />
        <Skeleton className="h-4 w-40" />
      </div>

      <div className="grid gap-8 lg:grid-cols-5 pb-24 lg:pb-0">
        {/* Left column — content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Image carousel */}
          <div className="rounded-2xl border bg-card overflow-hidden">
            <Skeleton className="aspect-[16/9] w-full" />
            <div className="p-6 space-y-4">
              <Skeleton className="h-9 w-3/4" />
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-28" />
              </div>
            </div>
          </div>

          {/* Description card */}
          <div className="rounded-2xl border bg-card p-6 space-y-3">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          {/* Highlights / itinerary card */}
          <div className="rounded-2xl border bg-card p-6 space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column — booking widget */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border bg-card p-6 space-y-5 lg:sticky lg:top-24">
            <Skeleton className="h-6 w-44" />

            {/* Calendar block */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-72 w-full rounded-lg" />
            </div>

            {/* Guest steppers */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            </div>

            {/* Total */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex justify-between pt-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>

            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
