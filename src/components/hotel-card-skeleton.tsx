import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function HotelCardSkeleton() {
  return (
    <Card className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      {/* Image area */}
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <Skeleton className="h-full w-full" />
        {/* Location badge top-left */}
        <div className="absolute top-3 left-3">
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
        {/* Star rating badge top-right */}
        <div className="absolute top-3 right-3">
          <Skeleton className="h-5 w-10 rounded-full" />
        </div>
      </div>

      <CardContent className="flex flex-col gap-3 p-4">
        {/* Hotel name */}
        <Skeleton className="h-5 w-4/5" />

        {/* Description lines */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        {/* Divider */}
        <div className="border-t" />

        {/* Button */}
        <Skeleton className="h-9 w-full rounded-md" />
      </CardContent>
    </Card>
  );
}
