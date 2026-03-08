import { createClient } from '@/lib/supabase/server';
import { BroadcastBanner } from '@/components/admin/broadcast-banner';
import { ImpersonationBanner } from '@/components/admin/impersonation-banner';
import { AdminLayoutShell } from '@/components/admin/layout-shell';
import { getCurrentAgency } from '@/lib/supabase/agencies';
import { getBookings } from '@/lib/supabase/bookings';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return children;
  }

  // Fetch current agency settings and pending bookings count
  const [agency, allBookings] = await Promise.all([getCurrentAgency(), getBookings()]);
  const settings = agency?.settings || {};
  const pendingBookingsCount = allBookings.filter((b) => b.status === 'Pending').length;

  return (
    <AdminLayoutShell user={user} settings={settings} pendingBookingsCount={pendingBookingsCount}>
      <div className="w-full">
        <ImpersonationBanner />
        <BroadcastBanner />
        {children}
      </div>
    </AdminLayoutShell>
  );
}
