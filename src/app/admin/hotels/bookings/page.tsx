import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getHotelBookings } from '@/lib/supabase/hotels';

export default async function AdminHotelBookingsPage() {
  const bookings = await getHotelBookings();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Hotel Bookings</h1>
          <p className="text-sm text-muted-foreground">Review and manage room bookings.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/hotels">Back</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
              No hotel bookings yet.
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.slice(0, 50).map((b) => (
                <div
                  key={b.id}
                  className="flex flex-col gap-2 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{b.guestName || b.guestEmail || 'Guest'}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {b.checkIn} → {b.checkOut} · {b.units} room(s) · {b.status}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" disabled>
                      Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
