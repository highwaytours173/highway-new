import { getBookings } from "@/lib/supabase/bookings";
import { BookingsClient } from "./bookings-client";

export default async function BookingsPage() {
  const bookings = await getBookings();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Bookings Management
          </h2>
          <p className="text-muted-foreground">
            Here&apos;s a list of all tour bookings from your customers.
          </p>
        </div>
      </div>
      <BookingsClient initialBookings={bookings} />
    </div>
  );
}
