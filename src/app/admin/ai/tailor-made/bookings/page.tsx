import { ensureAgencyAccess } from '@/lib/supabase/agency-users';
import { BookingsInboxClient } from './bookings-inbox-client';

export const dynamic = 'force-dynamic';

export default async function TailorMadeBookingsPage() {
  await ensureAgencyAccess();
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Booking requests</h2>
        <p className="text-muted-foreground">
          Visitors who hit &quot;Request to book&quot; after generating a tailor-made
          itinerary show up here. Mark them <em>Contacted</em> after you reach out, or{' '}
          <em>Closed</em> once the trip is booked.
        </p>
      </div>
      <BookingsInboxClient />
    </div>
  );
}
