import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function TourCardSkeleton() {
  return (
    <Card className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      {/* Image area */}
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <Skeleton className="h-full w-full" />
        {/* Badge placeholder top-left */}
        <div className="absolute top-3 left-3">
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        {/* Rating badge top-right */}
        <div className="absolute top-3 right-3">
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
        {/* Wishlist button bottom-right */}
        <div className="absolute bottom-3 right-3">
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>

      <CardContent className="flex flex-col gap-3 p-4">
        {/* Tour name */}
        <Skeleton className="h-5 w-4/5" />

        {/* Duration + destination row */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>

        {/* Divider */}
        <div className="border-t" />

        {/* Price + button row */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-5 w-20" />
          </div>
          <Skeleton className="h-9 w-28 rounded-md" />
        </div>
      </CardContent>
    </Card>
  );
}
