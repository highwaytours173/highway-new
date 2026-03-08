import { Skeleton } from '@/components/ui/skeleton';
import { HotelCardSkeleton } from '@/components/hotel-card-skeleton';

export default function HotelsLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      {/* Page heading */}
      <div className="mb-8 space-y-2">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-5 w-72" />
      </div>

      {/* Hotel cards grid — 6 skeleton cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <HotelCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
